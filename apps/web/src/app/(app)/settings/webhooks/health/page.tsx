import {
  getWebhookDeliveryMetrics,
  getWebhookJobMetrics,
} from '@jazm/db/analytics'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'

export const dynamic = 'force-dynamic'

const DRY_RUN = process.env.WEBHOOKS_REPORT_DRY_RUN === '1'
const HAS_DATABASE = Boolean(process.env.DATABASE_URL)

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return '—'
  }
  return value.toLocaleString()
}

function formatDate(value: Date | null) {
  if (!value) return '—'
  return value.toISOString()
}

type TelemetrySnapshot = {
  deliveries: Awaited<ReturnType<typeof getWebhookDeliveryMetrics>>
  jobs: Awaited<ReturnType<typeof getWebhookJobMetrics>>
}

function buildDryRunSnapshot(): TelemetrySnapshot {
  return {
    deliveries: [
      {
        topic: 'customers/data_request',
        deliveries: 0,
        duplicateEvents: 0,
        p95LatencyMs: null,
        versionDrift: 0,
        lastReceivedAt: null,
      },
      {
        topic: 'customers/redact',
        deliveries: 0,
        duplicateEvents: 0,
        p95LatencyMs: null,
        versionDrift: 0,
        lastReceivedAt: null,
      },
      {
        topic: 'shop/redact',
        deliveries: 0,
        duplicateEvents: 0,
        p95LatencyMs: null,
        versionDrift: 0,
        lastReceivedAt: null,
      },
    ],
    jobs: [
      {
        topic: 'customers_data_request',
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        overdue: 0,
        p95Attempts: null,
      },
      {
        topic: 'customers_redact',
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        overdue: 0,
        p95Attempts: null,
      },
      {
        topic: 'shop_redact',
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        overdue: 0,
        p95Attempts: null,
      },
    ],
  }
}

async function loadMetrics(): Promise<TelemetrySnapshot> {
  if (DRY_RUN || !HAS_DATABASE) {
    if (!HAS_DATABASE) {
      console.warn('[webhooks/health] DATABASE_URL missing – serving dry-run snapshot')
    }
    return buildDryRunSnapshot()
  }

  try {
    const [deliveries, jobs] = await Promise.all([
      getWebhookDeliveryMetrics({
        expectedApiVersion: SHOPIFY_ADMIN_API_VERSION,
        sinceHours: 24,
      }),
      getWebhookJobMetrics(),
    ])

    return { deliveries, jobs }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[webhooks/health] failed to load metrics, returning dry-run snapshot', {
      message,
    })
    return buildDryRunSnapshot()
  }
}

export default async function WebhooksHealthPage() {
  const { deliveries, jobs } = await loadMetrics()

  return (
    <main className="space-y-10 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Webhook Health</h1>
        <p className="text-sm text-muted-foreground">
          24h delivery stats, API-version drift, and queue health for GDPR topics.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Deliveries (last 24h)</h2>
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="text-left text-sm font-medium text-muted-foreground">
              <th className="py-2 pr-4">Topic</th>
              <th className="py-2 pr-4">Deliveries</th>
              <th className="py-2 pr-4">Duplicates</th>
              <th className="py-2 pr-4">p95 Latency (ms)</th>
              <th className="py-2 pr-4">Version Drift</th>
              <th className="py-2">Last Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {deliveries.map((row) => (
              <tr key={row.topic}>
                <td className="py-2 pr-4 font-medium">{row.topic}</td>
                <td className="py-2 pr-4">{formatNumber(row.deliveries)}</td>
                <td className="py-2 pr-4">{formatNumber(row.duplicateEvents)}</td>
                <td className="py-2 pr-4">{formatNumber(row.p95LatencyMs)}</td>
                <td className="py-2 pr-4">{formatNumber(row.versionDrift)}</td>
                <td className="py-2">{formatDate(row.lastReceivedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Queue Health</h2>
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="text-left text-sm font-medium text-muted-foreground">
              <th className="py-2 pr-4">Topic</th>
              <th className="py-2 pr-4">Pending</th>
              <th className="py-2 pr-4">Processing</th>
              <th className="py-2 pr-4">Completed</th>
              <th className="py-2 pr-4">Failed</th>
              <th className="py-2 pr-4">Overdue</th>
              <th className="py-2">p95 Attempts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {jobs.map((row) => (
              <tr key={row.topic}>
                <td className="py-2 pr-4 font-medium">{row.topic}</td>
                <td className="py-2 pr-4">{formatNumber(row.pending)}</td>
                <td className="py-2 pr-4">{formatNumber(row.processing)}</td>
                <td className="py-2 pr-4">{formatNumber(row.completed)}</td>
                <td className="py-2 pr-4">{formatNumber(row.failed)}</td>
                <td className="py-2 pr-4">{formatNumber(row.overdue)}</td>
                <td className="py-2">{formatNumber(row.p95Attempts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
