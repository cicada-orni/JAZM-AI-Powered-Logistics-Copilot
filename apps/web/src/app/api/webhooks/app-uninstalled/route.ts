import { NextResponse } from 'next/server'
import {
  parseShopifyWebhook,
  resolveWebhookErrorStatus,
} from '@/lib/shopify-webhooks'
import { recordWebhookOnce } from '@jazm/db/webhooks'
import { markUninstalled } from '@jazm/db/shopTokens'
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
    if (firstTime) {
      await markUninstalled(meta.shop)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = resolveWebhookErrorStatus(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[webhook app-uninstalled] error', {
      message,
      status,
    })
    return NextResponse.json({ ok: false }, { status })
  }
}
