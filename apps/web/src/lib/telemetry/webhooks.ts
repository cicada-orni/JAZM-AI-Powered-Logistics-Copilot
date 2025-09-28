import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'

type LogLevel = 'info' | 'warn' | 'error'

type BasePayload = {
  event: string
  level?: LogLevel
  timestamp?: string
  [key: string]: unknown
}

// Structured Logs
function emitStructuredLog({
  level = 'info',
  timestamp,
  ...rest
}: BasePayload) {
  const record = {
    timestamp: timestamp ?? new Date().toISOString(),
    app: 'jazm-web',
    ...rest,
  }

  const payload = JSON.stringify(record)
  if (level === 'warn') {
    console.warn(payload)
  } else if (level === 'error') {
    console.error(payload)
  } else {
    console.info(payload)
  }
}

// Webhook Delivery Logs
export function logWebhookDelivery(params: {
  handler: 'app-uninstalled' | 'gdpr'
  topic: string
  shopDomain: string
  webhookId: string
  eventId: string
  apiVersion: string
  duplicate: boolean
  latencyMs: number | null
  jobId?: string
}) {
  emitStructuredLog({
    event: 'webhook.delivery',
    handler: params.handler,
    topic: params.topic,
    shopDomain: params.shopDomain,
    webhookId: params.webhookId,
    eventId: params.eventId,
    apiVersion: params.apiVersion,
    expectedApiVersion: SHOPIFY_ADMIN_API_VERSION,
    duplicate: params.duplicate,
    latencyMs: params.latencyMs,
    jobId: params.jobId,
  })
}

// Webhook Error Logs
export function logWebhookError(params: {
  handler: 'app-uninstalled' | 'gdpr'
  topic?: string
  shopDomain?: string
  webhookId?: string
  eventId?: string
  error: Error | unknown
}) {
  const message =
    params.error instanceof Error ? params.error.message : String(params.error)

  emitStructuredLog({
    event: 'webhook.delivery.error',
    level: 'error',
    handler: params.handler,
    topic: params.topic,
    shopDomain: params.shopDomain,
    webhookId: params.webhookId,
    eventId: params.eventId,
    message,
  })
}

// Webhook Job Processing Logs
export function logWebhookJobEvent(params: {
  outcome: 'reserved' | 'completed' | 'retry' | 'failed'
  jobId: string
  topic: string
  attempts: number
  runDurationMs?: number
  nextRunAt?: Date
  message?: string
}) {
  emitStructuredLog({
    event: 'webhook.job',
    outcome: params.outcome,
    jobId: params.jobId,
    topic: params.topic,
    attempts: params.attempts,
    runDurationMs: params.runDurationMs,
    nextRunAt: params.nextRunAt?.toISOString(),
    message: params.message,
    level:
      params.outcome === 'failed'
        ? 'error'
        : params.outcome === 'retry'
          ? 'warn'
          : 'info',
  })
}
