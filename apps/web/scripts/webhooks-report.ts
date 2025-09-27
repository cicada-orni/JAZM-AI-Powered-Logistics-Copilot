import {
  getWebhookDeliveryMetrics,
  getWebhookJobMetrics,
} from '@jazm/db/analytics'
import { SHOPIFY_ADMIN_API_VERSION } from '../src/config/shopifyApiVersion'

async function main() {
  const [deliveries, jobs] = await Promise.all([
    getWebhookDeliveryMetrics({
      expectedApiVersion: SHOPIFY_ADMIN_API_VERSION,
      sinceHours: 24,
    }),
    getWebhookJobMetrics(),
  ])

  console.log('\nWebhook deliveries (24h)')
  console.table(
    deliveries.map((row) => ({
      topic: row.topic,
      deliveries: row.deliveries,
      duplicates: row.duplicateEvents,
      p95LatencyMs: row.p95LatencyMs ?? 'n/a',
      versionDrift: row.versionDrift,
      lastReceivedAt: row.lastReceivedAt?.toISOString() ?? 'n/a',
    }))
  )

  console.log('\nQueue health')
  console.table(
    jobs.map((row) => ({
      topic: row.topic,
      pending: row.pending,
      processing: row.processing,
      completed: row.completed,
      failed: row.failed,
      overdue: row.overdue,
      p95Attempts: row.p95Attempts ?? 'n/a',
    }))
  )
}

main().catch((error) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error)
  console.error('[webhooks-report] fatal error', { message })
  process.exit(1)
})
