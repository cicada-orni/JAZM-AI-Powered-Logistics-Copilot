import { NextResponse } from 'next/server'
import {
  parseShopifyWebhook,
  resolveWebhookErrorStatus,
} from '@/lib/shopify-webhooks'
import { recordWebhookOnce } from '@jazm/db/webhooks'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'
import { enqueueWebhookJob } from '@jazm/db/jobs'
import type { InputJsonValue } from '@jazm/db/types'
import { planGdprJob, toWebhookJobTopic } from '@/jobs/gdpr'

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

    const plan = planGdprJob({
      topic: meta.topic,
      shop: meta.shop,
      webhookId: meta.webhookId,
      eventId: meta.eventId,
      payload,
      receivedAt,
    })

    await enqueueWebhookJob({
      topic: toWebhookJobTopic(plan.job.topic),
      shopDomain: plan.job.shopDomain,
      payload: plan.job,
      dueAt: plan.dueAt,
    })

    return NextResponse.json({
      ok: true,
      jobQueued: true,
      latencyMs: dedupe.latencyMs,
    })
  } catch (error) {
    const status = resolveWebhookErrorStatus(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook gdpr] error', { message, status })
    return NextResponse.json({ ok: false }, { status })
  }
}
