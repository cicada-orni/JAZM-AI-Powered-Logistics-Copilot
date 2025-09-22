import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'
import { parseShopifyWebhook } from '@/lib/shopify-webhooks'

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
      'x-shopify-api-version': SHOPIFY_ADMIN_API_VERSION,
      ...headers,
    },
  })
}

describe('parseShopifyWebhook', () => {
  it('captures metadata and headers when signature is valid', async () => {
    const parsed = await parseShopifyWebhook(
      buildRequest(
        { id: 1 },
        {
          'x-shopify-topic': 'customers/redact',
          'x-shopify-shop-domain': 'demo.myshopify.com',
          'x-shopify-webhook-id': 'wh-1',
          'x-shopify-event-id': 'evt-1',
        }
      ),
      SECRET
    )

    expect(parsed.meta).toMatchObject({
      topic: 'customers/redact',
      shop: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
      apiVersion: SHOPIFY_ADMIN_API_VERSION,
    })
    expect(parsed.headers['x-shopify-webhook-id']).toBe('wh-1')
  })

  it('rejects invalid signatures', async () => {
    const badReq = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'x-shopify-hmac-sha256': 'bad' },
    })
    await expect(parseShopifyWebhook(badReq, SECRET)).rejects.toThrow(
      'Invalid HMAC signature'
    )
  })
})
