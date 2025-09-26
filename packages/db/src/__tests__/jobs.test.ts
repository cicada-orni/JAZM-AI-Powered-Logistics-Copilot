import { describe, expect, it, vi, afterEach } from 'vitest'
import { prisma } from '../client'

import {
  enqueueWebhookJob,
  reserveNextWebhookJob,
  completeWebhookJob,
  retryWebhookJob,
  failWebhookJob,
} from '../jobs'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('enqueueWebhookJob', () => {
  it('stores default and pending status', async () => {
    const createSpy = vi
      .spyOn(prisma.webhook_jobs, 'create')
      .mockResolvedValueOnce({} as never)

    await enqueueWebhookJob({
      topic: 'customers_data_request',
      shopDomain: 'demo.myshopify.com',
      payload: { ok: true },
    })

    expect(createSpy).toBeCalled()
    const args = createSpy.mock.calls[0][0]
    expect(args.data.status).toBe('pending')
    expect(args.data.attempts).toBe(0)
    expect(args.data.due_at).toBeInstanceOf(Date)
  })
})

describe('reserveNextWebhookJob', () => {
  it('increments attempts and marks processing', async () => {
    const now = new Date('2025-09-24T12:00:00Z')
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: 'job-1', attempts: 1 }]),
      webhook_jobs: {
        update: vi.fn().mockResolvedValue({
          id: 'job-1',
          status: 'processing',
          attempts: 2,
        } as never),
      },
    } as unknown as Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

    const transactionSpy = vi
      .spyOn(prisma, '$transaction')
      .mockImplementation(async (fn: any) => fn(tx))

    await reserveNextWebhookJob(now)

    expect(transactionSpy).toHaveBeenCalled()
    expect(tx.$queryRaw).toHaveBeenCalled()
    expect(tx.webhook_jobs.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: {
        status: 'processing',
        attempts: 2,
        last_attempt: now,
        last_error: null,
      },
    })
  })
})

describe('retryWebhookJob', () => {
  it('reschedules processing job', async () => {
    const updateSpy = vi
      .spyOn(prisma.webhook_jobs, 'update')
      .mockResolvedValueOnce({} as never)
    const nextRunAt = new Date('2025-09-24T12:05:00Z')

    await retryWebhookJob({
      id: 'job-1',
      nextRunAt,
      error: new Error('boom'),
    })

    expect(updateSpy).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: {
        status: 'pending',
        run_at: nextRunAt,
        last_error: 'boom',
      },
    })
  })
})

describe('failWebhookJob', () => {
  it('marks job as failed', async () => {
    const updateSpy = vi
      .spyOn(prisma.webhook_jobs, 'update')
      .mockResolvedValueOnce({} as never)

    await failWebhookJob({ id: 'job-1', error: 'fatal' })

    expect(updateSpy).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: {
        status: 'failed',
        last_error: 'fatal',
      },
    })
  })
})
