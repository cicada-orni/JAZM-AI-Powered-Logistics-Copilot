import { NextResponse } from 'next/server'
import {
  parseShopifyWebhook,
  resolveWebhookErrorStatus,
} from '@/lib/shopify-webhooks'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'
import { recordWebhookOnce, markShopRedacted } from '@jazm/db/webhooks'
import type { InputJsonValue } from '@jazm/db/types'

export async function POST(req: Request) {
  const secret = process.env.SHOPIFY_API_SECRET!
  try {
    const receivedAt = new Date()
    const { meta, payload, headers } =
      await parseShopifyWebhook<InputJsonValue>(req, secret)

    const dedupe = await recordWebhookOnce({
      id: meta.webhookId,
      eventId: meta.eventId,
      topic: meta.topic,
      shopDomain: meta.shop,
      apiVersion: meta.apiVersion || SHOPIFY_ADMIN_API_VERSION,
      triggeredAt: meta.triggeredAt,
      receivedAt,
      payload,
      headers,
    })

    if (!dedupe.firstDelivery) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        latencyMs: dedupe.latencyMs,
      })
    }

    if (meta.topic === 'shop/redact') {
      await markShopRedacted(meta.shop)
      // TODO Day 4+: purge persisted shop-scoped data
    }

    return NextResponse.json({ ok: true, latencyMs: dedupe.latencyMs })
  } catch (error) {
    const status = resolveWebhookErrorStatus(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook gdpr] error', { message, status })
    return NextResponse.json({ ok: false }, { status })
  }
}
