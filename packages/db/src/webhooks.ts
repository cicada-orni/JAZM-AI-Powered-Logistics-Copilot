import { prisma } from './client'
import { Prisma } from './generated/prisma'

export async function recordWebhookOnce(params: {
  id: string
  topic: string
  shopDomain: string
  triggered_at?: string
  payload: Prisma.InputJsonValue
}) {
  try {
    await prisma.webhook_deliveries.create({
      data: {
        webhook_id: params.id,
        topic: params.topic,
        shop_domain: params.shopDomain,
        triggered_at: params.triggered_at
          ? new Date(params.triggered_at)
          : null,
        payload: params.payload,
      },
    })
    return true
  } catch (error: unknown) {
    // Handle Prisma unique constraint violation without loosening types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' ||
        error.message.includes('Unique constraint')
      ) {
        return false
      }
    } else if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return false
      }
    }
    throw error
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
