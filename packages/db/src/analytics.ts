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

  const rows = await prisma.$queryRaw<
    {
      topic: string
      deliveries: bigint
      duplicate_events: bigint
      p95_latency_ms: unknown
      version_drift: bigint
      last_received_at: Date | null
    }[]
  >(Prisma.sql`
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
    deliveries: Number(row.deliveries ?? 0n),
    duplicateEvents: Number(row.duplicate_events ?? 0n),
    p95LatencyMs:
      row.p95_latency_ms === null || row.p95_latency_ms === undefined
        ? null
        : Number(row.p95_latency_ms),
    versionDrift: Number(row.version_drift ?? 0n),
    lastReceivedAt: row.last_received_at
      ? new Date(row.last_received_at)
      : null,
  }))
}

export async function getWebhookJobMetrics(): Promise<WebhookJobMetrics[]> {
  const rows = await prisma.$queryRaw<
    {
      topic: string
      pending: bigint
      processing: bigint
      completed: bigint
      failed: bigint
      overdue: bigint
      p95_attempts: unknown
    }[]
  >(Prisma.sql`
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
    pending: Number(row.pending ?? 0n),
    processing: Number(row.processing ?? 0n),
    completed: Number(row.completed ?? 0n),
    failed: Number(row.failed ?? 0n),
    overdue: Number(row.overdue ?? 0n),
    p95Attempts:
      row.p95_attempts === null || row.p95_attempts === undefined
        ? null
        : Number(row.p95_attempts),
  }))
}
