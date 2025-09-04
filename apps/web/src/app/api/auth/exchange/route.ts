// apps/web/src/app/api/auth/exchange/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { shopify } from '@/lib/shopify'
import { RequestedTokenType } from '@shopify/shopify-api'
import { upsertShopToken } from '@/lib/db'

/**
 * Safely pull an access token from the various shapes the SDK may return.
 * Supports: { access_token }, { accessToken }, { session: { accessToken } }
 */
function pickAccessToken(resp: unknown): string | null {
  if (!resp || typeof resp !== 'object') return null
  const o = resp as Record<string, unknown>
  if (typeof o['access_token'] === 'string') return o['access_token'] as string
  if (typeof o['accessToken'] === 'string') return o['accessToken'] as string
  const s = o['session']
  if (
    s &&
    typeof s === 'object' &&
    typeof (s as Record<string, unknown>)['accessToken'] === 'string'
  ) {
    return (s as Record<string, unknown>)['accessToken'] as string
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    // 1) Read session token from Authorization: Bearer <token>
    const auth = req.headers.get('authorization') ?? ''
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'missing_session_token' },
        { status: 401 }
      )
    }
    const sessionToken = auth.slice('Bearer '.length)

    // 2) Decode to learn the shop domain (dest is like https://shop.myshopify.com/admin)
    const payload = (await shopify.session.decodeSessionToken(
      sessionToken
    )) as { dest: string }
    const shop = new URL(payload.dest).hostname

    // 3) Exchange session token → durable OFFLINE token
    const exchangeResp = await shopify.auth.tokenExchange({
      shop,
      sessionToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    })

    // 4) Extract token from SDK response
    const offlineToken = pickAccessToken(exchangeResp)
    if (!offlineToken) {
      // Don’t write to DB; surface what we got for quick debugging in dev tools
      return NextResponse.json(
        { error: 'no_token_from_exchange', detail: exchangeResp },
        { status: 409 }
      )
    }

    // 5) Persist (idempotent)
    await upsertShopToken({
      shop_domain: shop,
      offline_access_token: offlineToken,
    })

    return NextResponse.json({ ok: true, shop }, { status: 200 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { error: 'exchange_failed', detail: msg },
      { status: 400 }
    )
  }
}
