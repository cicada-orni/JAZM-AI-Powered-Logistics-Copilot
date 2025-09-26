import { NextResponse } from 'next/server'
import {
  resolveWebhookErrorStatus,
  parseShopifyWebhook,
} from '@/lib/shopify-webhooks'
import { recordWebhookOnce } from '@jazm/db/webhooks'
import { markUninstalled } from '@jazm/db/shopTokens'
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
      apiVersion: meta.apiVersion,
      triggeredAt: meta.triggeredAt,
      receivedAt,
      payload,
      headers,
    })
    if (dedupe.firstDelivery) {
      await markUninstalled(meta.shop)
    }
    return NextResponse.json({
      ok: true,
      firstDelivery: dedupe.firstDelivery,
      latencyMs: dedupe.latencyMs,
    })
  } catch (error) {
    const status = resolveWebhookErrorStatus(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook app-uninstalled] error', { message, status })
    return NextResponse.json({ ok: false }, { status })
  }
}
