import { logWebhookDelivery, logWebhookError } from '@/lib/telemetry/webhooks'
import { markUninstalled } from '@jazm/db/shopTokens'
import { recordWebhookOnce } from '@jazm/db/webhooks'
import crypto from 'node:crypto'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const deliveryLogSpy = vi.fn()
const errorLogSpy = vi.fn()

vi.mock('@jazm/db/webhooks', () => ({
  recordWebhookOnce: vi.fn().mockResolvedValue({
    firstDelivery: true,
    latencyMs: 5,
  }),
}))

vi.mock('@jazm/db/shopTokens', () => ({
  markUninstalled: vi.fn(),
}))

vi.mock('@/lib/telemetry/webhooks', () => ({
  logWebhookDelivery: deliveryLogSpy,
  logWebhookError: errorLogSpy,
}))

const secret = 'test-secret'

function buildRequest(payload: object, headers: Record<string, string>) {
  const body = Buffer.from(JSON.stringify(payload))
  const hmac = crypto.createHmac('sha256', secret).update(body).digest('base64')
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
  process.env.SHOPIFY_API_SECRET = secret
  vi.clearAllMocks()
})

describe('app-uninstalled webhook', () => {
  it('logs delivery metadata', async () => {
    const { POST } = await import('./route')
    const req = buildRequest(
      { shop_id: 123 },
      {
        'x-shopify-topic': 'app/uninstalled',
        'x-shopify-shop-domain': 'demo.myshopify.com',
        'x-shopify-webhook-id': 'wh-1',
        'x-shopify-event-id': 'evt-1',
      }
    )

    const response = await POST(req)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toMatchObject({ ok: true })
    expect(deliveryLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({ handler: 'app-uninstalled', duplicate: false })
    )
    expect(errorLogSpy).not.toHaveBeenCalled()
  })
})
