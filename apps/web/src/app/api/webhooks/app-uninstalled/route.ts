import { NextResponse } from 'next/server'
import { verifyShopifyHmac } from '@/lib/verifyShopifyHmac'
import { recordWebhookOnce } from '@jazm/db/webhooks'
import { markUninstalled } from '@jazm/db/shopTokens'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const raw = Buffer.from(await req.arrayBuffer())
  const header = await headers()

  const webhook_id = header.get('x-shopify-webhook-id') ?? cryptoRandom()
  const topic = header.get('x-shopify-topic') ?? 'unknown'
  const shop_domain = header.get('x-shopify-shop-domain') ?? ''
  const triggered_at = header.get('x-shopify-triggered-at') ?? undefined
  const hmac = header.get('x-shopify-hmac-sha256')

  const secret = process.env.SHOPIFY_API_SECRET!
  const ok = verifyShopifyHmac(secret, raw, hmac)
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 })

  const payload = JSON.parse(raw.toString('utf-8'))

  const firstTime = await recordWebhookOnce({
    id: webhook_id,
    topic,
    shopDomain: shop_domain,
    triggered_at,
    payload,
  })
  if (firstTime) {
    markUninstalled(shop_domain)
  }
  return NextResponse.json({ ok: true })
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2)
}
