import { prisma } from './client'

// To update or create the offline token in shops table
export async function upsertShopToken(params: {
  shopDomain: string
  offlineAccessToken: string
}) {
  await prisma.shops.upsert({
    where: { shop_domain: params.shopDomain },
    update: {
      offline_access_token: params.offlineAccessToken,
      uninstalled: false,
    },
    create: {
      shop_domain: params.shopDomain,
      offline_access_token: params.offlineAccessToken,
    },
  })
}

// to update the uninstalled value inside shops table
export async function markUninstalled(shopDomain: string) {
  await prisma.shops.update({
    where: {
      shop_domain: shopDomain,
    },
    data: {
      uninstalled: true,
    },
  })
}
