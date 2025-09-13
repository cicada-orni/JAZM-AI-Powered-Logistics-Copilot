import '@shopify/shopify-api/adapters/node'
import { shopifyApi } from '@shopify/shopify-api'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'

const rawAppUrl =
  process.env.SHOPIFY_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://127.0.0.1:3000')

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: (process.env.SHOPIFY_SCOPES ?? '').split(','),
  hostName: new URL(rawAppUrl).host,
  isEmbeddedApp: true,
  apiVersion: SHOPIFY_ADMIN_API_VERSION,
})
