import { NextResponse } from 'next/server'
import {
  resolveWebhookErrorStatus,
  parseShopifyWebhook,
  type ShopifyWebhookMeta,
} from '@/lib/shopify-webhooks'
import { logWebhookDelivery, logWebhookError } from '@/lib/telemetry/webhooks'
import { recordWebhookOnce } from '@jazm/db/webhooks'
import { markUninstalled } from '@jazm/db/shopTokens'
import type { InputJsonValue } from '@jazm/db/types'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'

export async function POST(req: Request) {
  const secret = process.env.SHOPIFY_API_SECRET!
  let meta: ShopifyWebhookMeta | undefined

  try {
    const receivedAt = new Date()
    const parsed = await parseShopifyWebhook<InputJsonValue>(req, secret)
    meta = parsed.meta

    const dedupe = await recordWebhookOnce({
      id: meta.webhookId,
      eventId: meta.eventId,
      topic: meta.topic,
      shopDomain: meta.shop,
      apiVersion: meta.apiVersion || SHOPIFY_ADMIN_API_VERSION,
      triggeredAt: meta.triggeredAt,
      receivedAt,
      payload: parsed.payload,
      headers: parsed.headers,
    })

    if (dedupe.firstDelivery) {
      await markUninstalled(meta.shop)
    }

    logWebhookDelivery({
      handler: 'app-uninstalled',
      topic: meta.topic,
      shopDomain: meta.shop,
      webhookId: meta.webhookId,
      eventId: meta.eventId,
      apiVersion: meta.apiVersion,
      duplicate: !dedupe.firstDelivery,
      latencyMs: dedupe.latencyMs,
    })

    return NextResponse.json({
      ok: true,
      firstDelivery: dedupe.firstDelivery,
      latencyMs: dedupe.latencyMs,
    })
  } catch (error) {
    logWebhookError({
      handler: 'app-uninstalled',
      topic: meta?.topic,
      shopDomain: meta?.shop,
      webhookId: meta?.webhookId,
      eventId: meta?.eventId,
      error,
    })

    const status = resolveWebhookErrorStatus(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook app-uninstalled] error', { message, status })
    return NextResponse.json({ ok: false }, { status })
  }
}
