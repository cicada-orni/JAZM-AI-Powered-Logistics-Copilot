// apps/web/src/lib/host.ts
// Purpose: helpers to store/retrieve host/shop and to append them to URLs safely.

const HOST_KEY = 'jazm.host'
const SHOP_KEY = 'jazm.shop'

// Guard against SSR and older browsers
const safeStorage =
  typeof window !== 'undefined' ? window.sessionStorage : undefined

export function getStoredHost(): string | null {
  try {
    return safeStorage?.getItem(HOST_KEY) ?? null
  } catch {
    return null
  }
}

export function setStoredHost(host: string) {
  try {
    // Simple allowlist: base64url (A–Z a–z 0–9 - _ =) since Shopify encodes host
    if (!/^[A-Za-z0-9\-_=]+$/.test(host)) return
    safeStorage?.setItem(HOST_KEY, host)
  } catch {}
}

export function getStoredShop(): string | null {
  try {
    return safeStorage?.getItem(SHOP_KEY) ?? null
  } catch {
    return null
  }
}

export function setStoredShop(shop: string) {
  try {
    // Only accept *.myshopify.com to avoid poisoning
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)) return
    safeStorage?.setItem(SHOP_KEY, shop.toLowerCase())
  } catch {}
}

export function withHostParams(
  href: string,
  host?: string | null,
  shop?: string | null
): string {
  // Append host (& shop if present) to href's query string.
  try {
    const url = new URL(
      href,
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://app.local'
    )
    if (host && !url.searchParams.get('host'))
      url.searchParams.set('host', host)
    if (shop && !url.searchParams.get('shop'))
      url.searchParams.set('shop', shop)
    return url.pathname + (url.search ? `${url.search}` : '')
  } catch {
    // Fallback: naive concatenation for relative paths
    const sep = href.includes('?') ? '&' : '?'
    const parts = []
    if (host && !href.includes('host='))
      parts.push(`host=${encodeURIComponent(host)}`)
    if (shop && !href.includes('shop='))
      parts.push(`shop=${encodeURIComponent(shop)}`)
    return parts.length ? `${href}${sep}${parts.join('&')}` : href
  }
}
