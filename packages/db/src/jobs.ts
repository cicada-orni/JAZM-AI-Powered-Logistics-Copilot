import { prisma } from './client'
import { Prisma } from './generated/prisma'
import { webhook_job_topic } from './generated/prisma'

export type WebhookJobTopic = webhook_job_topic

type EnqueueWebhookJobParams = {
  topic: WebhookJobTopic
  shopDomain: string
  payload: Prisma.InputJsonValue
  runAt?: Date
  dueAt?: Date
}

const DEFAULT_DUE_MS = 30 * 24 * 60 * 60 * 1000

// ENQUEUE WEBHOOKS
export async function enqueueWebhookJob(params: EnqueueWebhookJobParams) {
  return prisma.webhook_jobs.create({
    data: {
      topic: params.topic,
      shop_domain: params.shopDomain,
      payload: params.payload,
      status: 'pending',
      run_at: params.runAt ?? new Date(),
      due_at: params.dueAt ?? new Date(Date.now() + DEFAULT_DUE_MS),
      attempts: 0,
      last_error: null,
    },
  })
}

// RESERVE WEBHOOKS FOR NEXT JOB
export async function reserveNextWebhookJob(now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const [row] = await tx.$queryRaw<{ id: string; attempts: number | null }[]>`
      SELECT id, attempts
      FROM webhook_jobs
      WHERE status = 'pending' AND run_at <= ${now}
      ORDER BY run_at ASC, queued_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `

    if (!row) {
      return null
    }

    const attempts = (row.attempts ?? 0) + 1

    return tx.webhook_jobs.update({
      where: { id: row.id },
      data: {
        status: 'processing',
        attempts,
        last_attempt: now,
        last_error: null,
      },
    })
  })
}

// COMPLETED WEBHOOK
export async function completeWebhookJob(id: string) {
  return prisma.webhook_jobs.update({
    where: { id },
    data: {
      status: 'completed',
      last_error: null,
    },
  })
}

// RETRY WEBHOOK
export async function retryWebhookJob(params: {
  id: string
  nextRunAt: Date
  error: unknown
}) {
  const message =
    params.error instanceof Error ? params.error.message : String(params.error)

  return prisma.webhook_jobs.update({
    where: { id: params.id },
    data: {
      status: 'pending',
      run_at: params.nextRunAt,
      last_error: message,
    },
  })
}

// FAIL WEBHOOK
export async function failWebhookJob(params: { id: string; error: unknown }) {
  const message =
    params.error instanceof Error ? params.error.message : String(params.error)

  return prisma.webhook_jobs.update({
    where: { id: params.id },
    data: {
      status: 'failed',
      last_error: message,
    },
  })
}
