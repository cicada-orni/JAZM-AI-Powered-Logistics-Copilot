import 'server-only'
import '@shopify/shopify-api/adapters/node'
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api'

const appUrl = process.env.SHOPIFY_APP_URL! // 1) Your deployed origin on Vercel
const hostName = new URL(appUrl).host // 2) Host the SDK needs (no scheme)

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!, // 3) Client ID
  apiSecretKey: process.env.SHOPIFY_API_SECRET!, // 4) Client Secret (for JWT verify & exchange)
  scopes: (process.env.SHOPIFY_SCOPES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean), // 5) Scopes array
  hostName, // 6) Domain only
  isEmbeddedApp: true, // 7) Embedded → session tokens flow
  apiVersion: LATEST_API_VERSION, // 8) Stay on latest stable
})
