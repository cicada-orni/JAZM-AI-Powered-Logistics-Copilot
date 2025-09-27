import { NextResponse } from 'next/server'
import {
  parseShopifyWebhook,
  resolveWebhookErrorStatus,
  type ShopifyWebhookMeta,
} from '@/lib/shopify-webhooks'
import { logWebhookDelivery, logWebhookError } from '@/lib/telemetry/webhooks'
import { recordWebhookOnce } from '@jazm/db/webhooks'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'
import { enqueueWebhookJob } from '@jazm/db/jobs'
import type { InputJsonValue } from '@jazm/db/types'
import { planGdprJob, toWebhookJobTopic } from '@/jobs/gdpr'

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

    if (!dedupe.firstDelivery) {
      logWebhookDelivery({
        handler: 'gdpr',
        topic: meta.topic,
        shopDomain: meta.shop,
        webhookId: meta.webhookId,
        eventId: meta.eventId,
        apiVersion: meta.apiVersion,
        duplicate: true,
        latencyMs: dedupe.latencyMs,
      })
      return NextResponse.json({
        ok: true,
        duplicate: true,
        latencyMs: dedupe.latencyMs,
      })
    }

    const plan = planGdprJob({
      topic: meta.topic,
      shop: meta.shop,
      webhookId: meta.webhookId,
      eventId: meta.eventId,
      payload: parsed.payload,
      receivedAt,
    })

    const jobRecord = await enqueueWebhookJob({
      topic: toWebhookJobTopic(plan.job.topic),
      shopDomain: plan.job.shopDomain,
      payload: plan.job,
      dueAt: plan.dueAt,
    })

    logWebhookDelivery({
      handler: 'gdpr',
      topic: meta.topic,
      shopDomain: meta.shop,
      webhookId: meta.webhookId,
      eventId: meta.eventId,
      apiVersion: meta.apiVersion,
      duplicate: false,
      latencyMs: dedupe.latencyMs,
      jobId: jobRecord.id,
    })

    return NextResponse.json({
      ok: true,
      jobQueued: true,
      latencyMs: dedupe.latencyMs,
      jobId: jobRecord.id,
    })
  } catch (error) {
    logWebhookError({
      handler: 'gdpr',
      topic: meta?.topic,
      shopDomain: meta?.shop,
      webhookId: meta?.webhookId,
      eventId: meta?.eventId,
      error,
    })

    const status = resolveWebhookErrorStatus(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook gdpr] error', { message, status })
    return NextResponse.json({ ok: false }, { status })
  }
}
