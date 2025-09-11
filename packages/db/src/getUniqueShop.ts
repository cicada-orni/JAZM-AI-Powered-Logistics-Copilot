import { prisma } from './client'

/**
 * Fetches a shop record by its myshopify domain.
 * @param shopDomain The myshopify.com domain of the shop.
 * @returns The shop object or null if not found.
 */

export async function getShopByDomain(shopDomain: string) {
  return await prisma.shops.findUnique({
    where: { shop_domain: shopDomain },
    select: {
      shop_domain: true,
      offline_access_token: true,
      installed_at: true,
      uninstalled: true,
      redacted_at: true,
    },
  })
}

/**
 * Ensure the shop exists, is not uninstalled, and has an offline token.
 * Throws a clear error if any precondition fails.
 */

export async function requireActiveShop(shopDomain: string) {
  const shop = await getShopByDomain(shopDomain)
  if (!shop) {
    throw new Error(`Shop now found ${shopDomain}`)
  }

  if (shop.uninstalled) {
    throw new Error(`Shop ${shopDomain} is uninstalled`)
  }

  if (!shop.offline_access_token) {
    throw new Error(`Shop ${shopDomain} has no offline access token`)
  }
  return shop
}
