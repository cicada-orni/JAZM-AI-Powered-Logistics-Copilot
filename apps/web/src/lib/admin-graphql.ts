import { createAdminApiClient } from '@shopify/admin-api-client'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'
import { requireActiveShop } from '@jazm/db/getUniqueShop'

export async function getAdminGraphQLClient(shopDomain: string) {
  const shop = await requireActiveShop(shopDomain)
  return createAdminApiClient({
    storeDomain: shop.shop_domain,
    accessToken: shop.offline_access_token,
    apiVersion: SHOPIFY_ADMIN_API_VERSION,
  })
}
