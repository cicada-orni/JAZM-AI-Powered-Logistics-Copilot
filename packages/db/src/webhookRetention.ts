import { pruneWebhookDeliveriesOlderThan } from './webhooks'

export async function pruneWebhookDeliveriesWeekly() {
  const deleted = await pruneWebhookDeliveriesOlderThan(24 * 7)
  console.info('[webhook retention] pruned rows', { deleted })
  return deleted
}
