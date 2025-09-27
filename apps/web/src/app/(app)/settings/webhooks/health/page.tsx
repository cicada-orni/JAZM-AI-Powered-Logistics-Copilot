import {
  getWebhookDeliveryMetrics,
  getWebhookJobMetrics,
} from '@jazm/db/analytics'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return '�'
  }
  return value.toLocaleString()
}

function formatDate(value: Date | null) {
  if (!value) return '�'
  return value.toISOString()
}

export default async function WebhooksHealthPage() {
  const [deliveries, jobs] = await Promise.all([
    getWebhookDeliveryMetrics({
      expectedApiVersion: SHOPIFY_ADMIN_API_VERSION,
      sinceHours: 24,
    }),
    getWebhookJobMetrics(),
  ])

  return (
    <main className="space-y-10 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Webhook Health</h1>
        <p className="text-sm text-muted-foreground">
          24h delivery stats, API-version drift, and queue health for GDPR
          topics.
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
                <td className="py-2 pr-4">
                  {formatNumber(row.duplicateEvents)}
                </td>
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
