import crypto from 'node:crypto'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const enqueueSpy = vi.fn()

vi.mock('@jazm/db/jobs', () => ({
  enqueueWebhookJob: enqueueSpy,
}))

vi.mock('@jazm/db/webhooks', () => ({
  recordWebhookOnce: vi
    .fn()
    .mockResolvedValue({ firstDelivery: true, latencyMs: 42 }),
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

    expect(enqueueSpy).toHaveBeenCalledTimes(1)
    const args = enqueueSpy.mock.calls[0][0]
    expect(args.topic).toBe('customers_data_request')
    expect(args.shopDomain).toBe('demo.myshopify.com')
    expect(args.payload).toMatchObject({
      topic: 'customers_data_request',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
    })
  })
})
