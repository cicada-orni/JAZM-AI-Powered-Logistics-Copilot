import { prisma } from './client'
import { Prisma } from './generated/prisma'
import type { webhook_job_topic } from './generated/prisma'

export type WebhookJobTopic = webhook_job_topic

type EnqueWebhookJobParams = {
  topic: WebhookJobTopic
  shopDomain: string
  payload: Prisma.InputJsonValue
  rutAt?: Date
  dueAt?: Date
}

export async function enqueueWebhookJob(params: EnqueWebhookJobParams) {
  return await prisma.webhook_jobs.create({
    data: {
      topic: params.topic,
      shop_domain: params.shopDomain,
      payload: params.payload,
      run_at: params.rutAt ?? new Date(),
      due_at: params.dueAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })
}

export async function reserveNextWebhookJob(now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.$queryRaw<{ id: string }[]>`
            SELECT id FROM webhook_jobs
            WHERE status = 'pending' AND run_at <= ${now}
            ORDER BY run_at ASC, queued_at ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        `
    if (job.length === 0) {
      return null
    }
    return tx.webhook_jobs.update({
      where: { id: job[0].id },
      data: {
        status: 'processing',
        attempts: { increment: 1 },
        last_attempt: now,
      },
    })
  })
}

export async function completeWebhookJob(id: string) {
  return prisma.webhook_jobs.update({
    where: { id },
    data: {
      status: 'completed',
    },
  })
}

export async function failWebhookJob(params: {
  id: string
  nextRunAt: Date
  error: unknown
}) {
  const lastError =
    params.error instanceof Error ? params.error.message : String(params.error)
  return prisma.webhook_jobs.update({
    where: { id: params.id },
    data: {
      status: 'failed',
      last_error: lastError,
      run_at: params.nextRunAt,
    },
  })
}
