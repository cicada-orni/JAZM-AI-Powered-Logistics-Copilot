import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const isDocument = req.headers.get('accept')?.includes('text/html')
  if (!isDocument) return NextResponse.next()

  const headerShop = req.headers.get('x-shopify-shop-domain') ?? ''
  const queryShop = url.searchParams.get('shop') ?? ''
  const shop = (headerShop || queryShop || '').trim().toLowerCase()

  const res = NextResponse.next()

  if (shop.endsWith('.myshopify.com')) {
    const csp = `frame-ancestors https://${shop} https://admin.shopify.com;`
    res.headers.set('Content-Security-Policy', csp)
  } else {
    res.headers.set('Content-Security-Policy', "frame-ancestors 'none';")
  }
  return res
}

// Limit to app routes that render HTML (adjust as needed).
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
