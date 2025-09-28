import crypto from 'node:crypto'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'

export type ShopifyWebhookMeta = {
  topic: string
  shop: string
  webhookId: string
  eventId: string
  apiVersion: string
  triggeredAt?: string
}

export type ShopifyWebhookHeaders = Record<string, string | null>

export type ParsedShopifyWebhook<TPayload = unknown> = {
  meta: ShopifyWebhookMeta
  payload: TPayload
  rawBody: Buffer
  headers: ShopifyWebhookHeaders
}

function headersToObject(headers: Headers): ShopifyWebhookHeaders {
  const snapshot: ShopifyWebhookHeaders = {}
  headers.forEach((value, key) => {
    snapshot[key] = value
  })
  return snapshot
}

type ErrorWithStatus = Error & { status: number }

function verifyHmac(
  secret: string,
  rawBody: Buffer,
  headerHmac: string | null
): boolean {
  if (!headerHmac) return false
  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64')

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(headerHmac))
  } catch {
    return false
  }
}

function createWebhookError(message: string, status = 400): ErrorWithStatus {
  return Object.assign(new Error(message), { status })
}

export function resolveWebhookErrorStatus(
  error: unknown,
  fallback = 400
): number {
  if (typeof error === 'object' && error !== null) {
    const candidate = (error as { status?: unknown }).status
    if (typeof candidate === 'number') {
      return candidate
    }
  }
  return fallback
}

export async function parseShopifyWebhook<TPayload = unknown>(
  req: Request,
  secret: string
): Promise<ParsedShopifyWebhook<TPayload>> {
  const rawBody = Buffer.from(await req.arrayBuffer())
  const headers = new Headers(req.headers)

  const hmacHeader = headers.get('x-shopify-hmac-sha256')
  if (!verifyHmac(secret, rawBody, hmacHeader)) {
    throw createWebhookError('Invalid HMAC signature', 401)
  }

  const apiVersion = headers.get('x-shopify-api-version') ?? ''
  if (apiVersion && apiVersion !== SHOPIFY_ADMIN_API_VERSION) {
    console.warn('[webhook] api version drift', {
      expected: SHOPIFY_ADMIN_API_VERSION,
      received: apiVersion,
    })
  }

  const webhookId =
    headers.get('x-shopify-webhook-id') ??
    headers.get('x-shopify-topic-id') ??
    crypto.randomUUID()
  const eventId = headers.get('x-shopify-event-id') ?? webhookId
  const topic = (headers.get('x-shopify-topic') ?? '').toLowerCase()
  const shop = headers.get('x-shopify-shop-domain') ?? ''
  const triggeredAt = headers.get('x-shopify-triggered-at') ?? undefined
  const payload = JSON.parse(rawBody.toString('utf-8')) as TPayload

  return {
    rawBody,
    payload,
    headers: headersToObject(headers),
    meta: {
      topic,
      shop,
      webhookId,
      eventId,
      apiVersion: apiVersion || SHOPIFY_ADMIN_API_VERSION,
      triggeredAt,
    },
  }
}
