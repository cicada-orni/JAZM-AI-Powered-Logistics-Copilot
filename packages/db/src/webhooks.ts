import { prisma } from './client'
import { Prisma } from './generated/prisma'

export type RecordWebhookOnceParams = {
  id: string
  eventId: string
  topic: string
  shopDomain: string
  apiVersion: string
  triggeredAt?: string
  receivedAt?: Date
  payload: Prisma.InputJsonValue
  headers: Record<string, string | null>
}

export type RecordWebhookOnceResult = {
  firstDelivery: boolean
  latencyMs: number | null
}

function isUniqueConstraint(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
}

export async function recordWebhookOnce(
  params: RecordWebhookOnceParams
): Promise<RecordWebhookOnceResult> {
  const receivedAt = params.receivedAt ?? new Date()
  const triggeredAt = params.triggeredAt ? new Date(params.triggeredAt) : null
  const latencyMs = triggeredAt
    ? Math.max(0, receivedAt.getTime() - triggeredAt.getTime())
    : null

  try {
    await prisma.webhook_deliveries.create({
      data: {
        webhook_id: params.id,
        event_id: params.eventId,
        topic: params.topic,
        shop_domain: params.shopDomain,
        api_version: params.apiVersion,
        triggered_at: triggeredAt,
        received_at: receivedAt,
        duplicate_count: 0,
        latency_ms: latencyMs ?? undefined,
        payload: params.payload,
        headers: params.headers,
      },
    })
    return { firstDelivery: true, latencyMs }
  } catch (error) {
    if (!isUniqueConstraint(error)) throw error
    await prisma.webhook_deliveries.update({
      where: { event_id: params.eventId },
      data: {
        duplicate_count: { increment: 1 },
        last_received_at: receivedAt,
        triggered_at: triggeredAt,
        webhook_id: params.id,
        api_version: params.apiVersion,
      },
    })
    return { firstDelivery: false, latencyMs }
  }
}

export async function markShopRedacted(shopDomain: string) {
  await prisma.shops.updateMany({
    where: { shop_domain: shopDomain },
    data: {
      redacted_at: new Date(),
    },
  })
}

export async function pruneWebhookDeliveriesOlderThan(hours: number) {
  const cuttoff = new Date(Date.now() - hours * 60 * 60 * 1000)
  const result = await prisma.webhook_deliveries.deleteMany({
    where: { last_received_at: { lt: cuttoff } },
  })
  return result.count
}
