import {
  reserveNextWebhookJob,
  completeWebhookJob,
  retryWebhookJob,
  failWebhookJob,
} from '@jazm/db/jobs'
import { parseGdprJobPayload, dispatchGdprJob } from './gdpr'

const MAX_ATTEMPTS = 5
const BASE_RETRY_MS = 10_000
const MAX_RETRY_MS = 5 * 60 * 1000

type Logger = Pick<typeof console, 'info' | 'warn' | 'error'>

export function calculateBackoffMs(attempt: number, base = BASE_RETRY_MS) {
  const clampedAttempt = Math.max(attempt, 1)
  return Math.min(base * 2 ** (clampedAttempt - 1), MAX_RETRY_MS)
}

export type ProcessNextOptions = {
  now?: Date
  logger?: Logger
}

export type ProcessNextResult =
  | { processed: false }
  | { processed: true; outcome: 'completed' | 'retry' | 'failed' }

export async function processNextWebhookJob(
  options: ProcessNextOptions = {}
): Promise<ProcessNextResult> {
  const { now = new Date(), logger = console } = options
  const job = await reserveNextWebhookJob(now)

  if (!job) {
    return { processed: false }
  }

  if (job.due_at && job.due_at < now) {
    logger.warn('[worker] job past due SLA', {
      id: job.id,
      topic: job.topic,
      dueAt: job.due_at,
    })
  }

  try {
    const payload = parseGdprJobPayload(job.payload)
    await dispatchGdprJob(payload)
    await completeWebhookJob(job.id)

    logger.info('[worker] job completed', {
      id: job.id,
      topic: job.topic,
      attempts: job.attempts,
    })

    return { processed: true, outcome: 'completed' }
  } catch (error) {
    const attempts = job.attempts ?? 1
    const message = error instanceof Error ? error.message : String(error)

    if (attempts < MAX_ATTEMPTS) {
      const delayMs = calculateBackoffMs(attempts)
      const nextRunAt = new Date(now.getTime() + delayMs)

      await retryWebhookJob({ id: job.id, nextRunAt, error })
      logger.warn('[worker] job retry scheduled', {
        id: job.id,
        topic: job.topic,
        attempts,
        nextRunAt,
        error: message,
      })

      return { processed: true, outcome: 'retry' }
    }

    await failWebhookJob({ id: job.id, error })
    logger.error('[worker] job failed permanently', {
      id: job.id,
      topic: job.topic,
      attempts,
      error: message,
    })

    return { processed: true, outcome: 'failed' }
  }
}

type SleepOptions = { signal?: AbortSignal }

function sleep(ms: number, options: SleepOptions = {}) {
  const { signal } = options
  if (!signal) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
  }

  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      resolve()
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export type WorkerOptions = ProcessNextOptions & {
  pollIntervalMs?: number
  signal?: AbortSignal
}

export async function runWebhookJobWorker(
  options: WorkerOptions = {}
): Promise<void> {
  const { pollIntervalMs = 2000, logger = console, signal } = options

  logger.info('[worker] starting', { pollIntervalMs })

  while (!signal?.aborted) {
    try {
      const result = await processNextWebhookJob({
        now: new Date(),
        logger,
      })

      if (!result.processed) {
        await sleep(pollIntervalMs, { signal })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error('[worker] unexpected error', { error: message })
      await sleep(pollIntervalMs, { signal })
    }
  }

  logger.info('[worker] stopped')
}
