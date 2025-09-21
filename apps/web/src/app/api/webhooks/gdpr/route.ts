import { NextResponse } from 'next/server'
import { parseShopifyWebhook, resolveWebhookErrorStatus } from '@/lib/shopify-webhooks'
import { recordWebhookOnce, markShopRedacted } from '@jazm/db/webhooks'
import type { InputJsonValue } from '@jazm/db/types'

export async function POST(req: Request) {
  const secret = process.env.SHOPIFY_API_SECRET!
  try {
    const { meta, payload } = await parseShopifyWebhook<InputJsonValue>(
      req,
      secret
    )

    const firstTime = await recordWebhookOnce({
      id: meta.webhookId,
      topic: meta.topic,
      shopDomain: meta.shop,
      triggered_at: meta.triggeredAt,
      payload,
    })

    if (!firstTime) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    if (meta.topic === 'shop/redact') {
      await markShopRedacted(meta.shop)
      // TODO: purge shop-specific data when persisted (address intelligence, etc.)
    }

    // TODO (later in Week 5): enqueue background jobs for customers/data_request and customers/redact

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = resolveWebhookErrorStatus(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook gdpr] error', {
      message,
      status,
    })
    return NextResponse.json({ ok: false }, { status })
  }
}
