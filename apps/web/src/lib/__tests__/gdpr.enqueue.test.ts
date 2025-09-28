import crypto from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const enqueueSpy = vi.fn().mockResolvedValue({ id: 'job-123' })
const deliveryLogSpy = vi.fn()
const errorLogSpy = vi.fn()

vi.mock('@jazm/db/jobs', () => ({
  enqueueWebhookJob: enqueueSpy,
}))

vi.mock('@jazm/db/webhooks', () => ({
  recordWebhookOnce: vi
    .fn()
    .mockResolvedValue({ firstDelivery: true, latencyMs: 42 }),
}))

vi.mock('@/lib/telemetry/webhooks', () => ({
  logWebhookDelivery: deliveryLogSpy,
  logWebhookError: errorLogSpy,
}))

const SECRET = 'test-secret'

function buildRequest(payload: object, headers: Record<string, string>) {
  const body = Buffer.from(JSON.stringify(payload))
  const hmac = crypto.createHmac('sha256', SECRET).update(body).digest('base64')
  return new Request('https://example.com', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      'x-shopify-hmac-sha256': hmac,
      'x-shopify-api-version': '2025-07',
      ...headers,
    },
  })
}

beforeEach(() => {
  process.env.SHOPIFY_API_SECRET = SECRET
  enqueueSpy.mockClear()
  enqueueSpy.mockResolvedValue({ id: 'job-123' })
  deliveryLogSpy.mockClear()
  errorLogSpy.mockClear()
})

describe('GDPR webhook enqueue', () => {
  it('enqueues job for customers/data_request', async () => {
    const { POST } = await import('@/app/api/webhooks/gdpr/route')
    const req = buildRequest(
      { shop_id: 123 },
      {
        'x-shopify-topic': 'customers/data_request',
        'x-shopify-shop-domain': 'demo.myshopify.com',
        'x-shopify-webhook-id': 'wh-1',
        'x-shopify-event-id': 'evt-1',
      }
    )

    await POST(req)

    expect(deliveryLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        handler: 'gdpr',
        topic: 'customers/data_request',
        jobId: 'job-123',
      })
    )
    expect(enqueueSpy).toHaveBeenCalledTimes(1)
    const call = enqueueSpy.mock.calls[0]
    expect(call).toBeDefined()
    const [args] = call
    expect(args).toBeDefined()
    expect(args?.topic).toBe('customers_data_request')
    expect(args?.shopDomain).toBe('demo.myshopify.com')
    expect(args?.payload).toMatchObject({
      topic: 'customers_data_request',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
    })
  })

  it('marks duplicates without queuing jobs', async () => {
    const { POST } = await import('@/app/api/webhooks/gdpr/route')
    const req = buildRequest(
      { shop_id: 123 },
      {
        'x-shopify-topic': 'customers_data_request',
        'x-shopify-shop-domain': 'demo.myshopify.com',
        'x-shopify-webhook-id': 'wh-dup',
        'x-shopify-event-id': 'evt-dup',
      }
    )

    const webhooksModule = await import('@jazm/db/webhooks')
    const recordWebhookOnceMock = vi.mocked(webhooksModule.recordWebhookOnce)
    recordWebhookOnceMock.mockResolvedValueOnce({
      firstDelivery: false,
      latencyMs: 12,
    })

    const response = await POST(req)
    const json = await response.json()

    expect(json).toMatchObject({ duplicate: true })
    expect(deliveryLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        handler: 'gdpr',
        duplicate: true,
      })
    )
    expect(enqueueSpy).not.toHaveBeenCalled()
  })
})
