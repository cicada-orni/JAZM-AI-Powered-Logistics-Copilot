import { NextResponse } from 'next/server'
import { verifyShopifyHmac } from '@/lib/verifyShopifyHmac'
import { recordWebhookOnce, markShopRedacted } from '@jazm/db/webhooks'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const raw = Buffer.from(await req.arrayBuffer())
  const header = await headers()

  const webhook_id = header.get('x-shopify-webhook-d') ?? cryptoRandom()
  const topic = (header.get('x-shopify-topic') ?? '').toLowerCase()
  const shop_domain = header.get('x-shopify-shop-domain') ?? ''
  const triggered_at = header.get('x-shopify-triggered-at') ?? undefined
  const hmac = header.get('x-shopify-hmac-sha256')

  const secret = process.env.SHOPIFY_API_SECRET!
  const ok = verifyShopifyHmac(secret, raw, hmac)
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 })

  const payload = JSON.parse(raw.toString('utf-8'))

  const firstTime = recordWebhookOnce({
    id: webhook_id,
    topic,
    shopDomain: shop_domain,
    triggered_at,
    payload,
  })
  if (firstTime) {
    if (topic === 'shop/redact') {
      // Mandatory: erase merchant data for this shop
      await markShopRedacted(shop)
      // (Also: purge app-private data rows keyed by this shop if any)
    } else if (topic === 'customers/redact') {
      // Delete/erase customer-specific data (if we store any).
      // payload contains customer identifiers and orders_to_redact when relevant.
      // https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance
    } else if (topic === 'customers/data_request') {
      // Export customer-related data (if any) and deliver to store owner.
      // Respond 200 now; do the export asynchronously (queue) to be safe.
    }
  }
  return NextResponse.json({ ok: true })
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2)
}
