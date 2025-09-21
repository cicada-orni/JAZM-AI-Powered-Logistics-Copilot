// import crypto from 'crypto'

// /**
//  * Verifies Shopify webhook HMAC signature.
//  * @param secret APP client secret (SHOPIFY_API_SECRET)
//  * @param rawBody Raw request body as Buffer (not parsed JSON!)
//  * @param headerHmac  Base64 from `X-Shopify-Hmac-Sha256`
//  */

// export function verifyShopifyHmac(
//   secret: string,
//   rawBody: Buffer,
//   headerHmac?: string | null
// ) {
//   if (!headerHmac) return false
//   const digest = crypto
//     .createHmac('sha256', secret)
//     .update(rawBody)
//     .digest('base64')
//   try {
//     return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(headerHmac))
//   } catch {
//     return false
//   }
// }
