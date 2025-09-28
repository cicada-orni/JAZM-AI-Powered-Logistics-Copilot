import { prisma } from './client'
import { Prisma } from './generated/prisma'

export type WebhookDeliveryMetrics = {
  topic: string
  deliveries: number
  duplicateEvents: number
  p95LatencyMs: number | null
  versionDrift: number
  lastReceivedAt: Date | null
}

export type WebhookJobMetrics = {
  topic: string
  pending: number
  processing: number
  completed: number
  failed: number
  overdue: number
  p95Attempts: number | null
}

function coerceNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'bigint') {
    return Number(value)
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function coerceCount(value: unknown): number {
  return coerceNullableNumber(value) ?? 0
}

export async function getWebhookDeliveryMetrics(params: {
  expectedApiVersion: string
  sinceHours?: number
}): Promise<WebhookDeliveryMetrics[]> {
  const since = params.sinceHours
    ? new Date(Date.now() - params.sinceHours * 60 * 60 * 1000)
    : null

  const whereClause = since
    ? Prisma.sql`WHERE received_at >= ${since}`
    : Prisma.sql``

  const rows = await prisma.$queryRaw<{
    topic: string
    deliveries: unknown
    duplicate_events: unknown
    p95_latency_ms: unknown
    version_drift: unknown
    last_received_at: Date | null
  }[]>(Prisma.sql`
    SELECT
      topic,
      COUNT(*)::bigint AS deliveries,
      SUM(duplicate_count)::bigint AS duplicate_events,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms)
        FILTER (WHERE latency_ms IS NOT NULL) AS p95_latency_ms,
      SUM(CASE WHEN api_version <> ${params.expectedApiVersion} THEN 1 ELSE 0 END)::bigint AS version_drift,
      MAX(last_received_at) AS last_received_at
    FROM webhook_deliveries
    ${whereClause}
    GROUP BY topic
    ORDER BY topic ASC;
  `)

  return rows.map((row) => ({
    topic: row.topic,
    deliveries: coerceCount(row.deliveries),
    duplicateEvents: coerceCount(row.duplicate_events),
    p95LatencyMs: coerceNullableNumber(row.p95_latency_ms),
    versionDrift: coerceCount(row.version_drift),
    lastReceivedAt: row.last_received_at ? new Date(row.last_received_at) : null,
  }))
}

export async function getWebhookJobMetrics(): Promise<WebhookJobMetrics[]> {
  const rows = await prisma.$queryRaw<{
    topic: string
    pending: unknown
    processing: unknown
    completed: unknown
    failed: unknown
    overdue: unknown
    p95_attempts: unknown
  }[]>(Prisma.sql`
    SELECT
      topic,
      COUNT(*) FILTER (WHERE status = 'pending')::bigint AS pending,
      COUNT(*) FILTER (WHERE status = 'processing')::bigint AS processing,
      COUNT(*) FILTER (WHERE status = 'completed')::bigint AS completed,
      COUNT(*) FILTER (WHERE status = 'failed')::bigint AS failed,
      COUNT(*) FILTER (
        WHERE status IN ('pending', 'processing') AND due_at < now()
      )::bigint AS overdue,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY COALESCE(attempts, 0)) AS p95_attempts
    FROM webhook_jobs
    GROUP BY topic
    ORDER BY topic ASC;
  `)

  return rows.map((row) => ({
    topic: row.topic,
    pending: coerceCount(row.pending),
    processing: coerceCount(row.processing),
    completed: coerceCount(row.completed),
    failed: coerceCount(row.failed),
    overdue: coerceCount(row.overdue),
    p95Attempts: coerceNullableNumber(row.p95_attempts),
  }))
}
