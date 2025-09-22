import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { prisma } from '../client'
import { Prisma } from '../generated/prisma'
import { recordWebhookOnce, type RecordWebhookOnceParams } from '../webhooks'

describe('recordWebhookOnce', () => {
  const base: RecordWebhookOnceParams = {
    id: 'wh-1',
    eventId: 'evt-1',
    topic: 'customers/redact',
    shopDomain: 'demo.myshopify.com',
    apiVersion: '2025-07',
    payload: { ok: true },
    headers: {},
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('flags first delivery on insert', async () => {
    vi.spyOn(prisma.webhook_deliveries, 'create').mockResolvedValueOnce({
      webhook_id: base.id,
    } as never)

    const result = await recordWebhookOnce(base)

    expect(result.firstDelivery).toBe(true)
    expect(prisma.webhook_deliveries.create).toHaveBeenCalledTimes(1)
  })

  it('increments duplicate count when event already exists', async () => {
    const uniqueError = Object.assign(
      Object.create(Prisma.PrismaClientKnownRequestError.prototype),
      {
        code: 'P2002',
        message: 'Unique constraint failed',
      }
    ) as Prisma.PrismaClientKnownRequestError

    vi.spyOn(prisma.webhook_deliveries, 'create').mockRejectedValueOnce(
      uniqueError
    )
    vi.spyOn(prisma.webhook_deliveries, 'update').mockResolvedValueOnce({
      webhook_id: base.id,
    } as never)

    const result = await recordWebhookOnce(base)

    expect(result.firstDelivery).toBe(false)
    expect(prisma.webhook_deliveries.update).toHaveBeenCalledTimes(1)
  })
})
