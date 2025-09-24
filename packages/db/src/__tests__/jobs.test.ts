import { describe, expect, it, vi, afterEach } from 'vitest'
import { prisma } from '../client'
import {
  enqueueWebhookJob,
  reserveNextWebhookJob,
  failWebhookJob,
} from '../jobs'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('enqueueWebhookJob', () => {
  it('applies default due date', async () => {
    const createSpy = vi.spyOn(prisma.webhook_jobs, 'create').mockResolvedValueOnce({} as never)

    await enqueueWebhookJob({
      topic: 'customers_data_request',
      shopDomain: 'demo.myshopify.com',
      payload: { ok: true },
    })

    expect(createSpy).toHaveBeenCalled()
    const args = createSpy.mock.calls[0][0]
    expect(args.data.due_at).toBeInstanceOf(Date)
  })
})

describe('reserveNextWebhookJob', () => {
  it('promotes pending job to processing', async () => {
    const updateResult = {
      id: 'd2719ce2-7c2d-4b38-9f48-3dcb65e0a001',
      status: 'processing',
    }
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: updateResult.id }]),
      webhook_jobs: {
        update: vi.fn().mockResolvedValue(updateResult),
      },
    } as unknown as Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

    const txSpy = vi
      .spyOn(prisma, '$transaction')
      .mockImplementation(async (fn: any) => fn(tx))

    const reserved = await reserveNextWebhookJob(new Date())

    expect(txSpy).toHaveBeenCalled()
    expect(tx.$queryRaw).toHaveBeenCalled()
    expect(tx.webhook_jobs.update).toHaveBeenCalled()
    expect(reserved?.status).toBe('processing')
  })
})

describe('failWebhookJob', () => {
  it('logs error and schedules retry', async () => {
    const updateSpy = vi.spyOn(prisma.webhook_jobs, 'update').mockResolvedValueOnce({} as never)
    const nextRun = new Date(Date.now() + 10_000)

    await failWebhookJob({ id: 'job-1', nextRunAt: nextRun, error: new Error('boom') })
    expect(updateSpy).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: {
        status: 'failed',
        last_error: 'boom',
        run_at: nextRun,
      },
    })
  })
})
