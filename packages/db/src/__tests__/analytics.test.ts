import { afterEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../client'
import { getWebhookDeliveryMetrics, getWebhookJobMetrics } from '../analytics'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getWebhookDeliveryMetrics', () => {
  it('maps SQL rows into delivery metrics', async () => {
    const now = new Date('2025-09-24T12:00:00Z')
    const querySpy = vi
      .spyOn(prisma, '$queryRaw')
      .mockResolvedValueOnce([
        {
          topic: 'customers/redact',
          deliveries: 5,
          duplicate_events: 1,
          p95_latency_ms: 120,
          version_drift: 0,
          last_received_at: now,
        },
      ])

    const metrics = await getWebhookDeliveryMetrics({
      expectedApiVersion: '2025-07',
    })

    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(metrics).toEqual([
      {
        topic: 'customers/redact',
        deliveries: 5,
        duplicateEvents: 1,
        p95LatencyMs: 120,
        versionDrift: 0,
        lastReceivedAt: now,
      },
    ])
  })
})

describe('getWebhookJobMetrics', () => {
  it('maps SQL rows into job metrics', async () => {
    const querySpy = vi
      .spyOn(prisma, '$queryRaw')
      .mockResolvedValueOnce([
        {
          topic: 'customers_redact',
          pending: 2,
          processing: 1,
          completed: 7,
          failed: 0,
          overdue: 0,
          p95_attempts: 2,
        },
      ])

    const metrics = await getWebhookJobMetrics()

    expect(querySpy).toHaveBeenCalledTimes(1)
    expect(metrics).toEqual([
      {
        topic: 'customers_redact',
        pending: 2,
        processing: 1,
        completed: 7,
        failed: 0,
        overdue: 0,
        p95Attempts: 2,
      },
    ])
  })
})
