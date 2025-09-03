export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { RequestedTokenType } from '@shopify/shopify-api'
import { shopify } from '@/lib/shopify'
import { upsertShopToken } from '@/lib/db'

export async function POST(req: NextRequest) {
  // 1) Read bearer session token from browser
  const auth = req.headers.get('authorization') || ''
  const sessionToken = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!sessionToken) {
    return NextResponse.json(
      { error: 'missing_session_token' },
      { status: 401 }
    )
  }

  try {
    // 2) Verify & decode the JWT from App Bridge (throws if expired/invalid)
    const decoded = await shopify.session.decodeSessionToken(sessionToken)
    const shop = new URL(decoded.dest).hostname // e.g., jazm-ai.myshopify.com

    // 3) Exchange session token → durable OFFLINE access token
    const resp = await shopify.auth.tokenExchange({
      shop,
      sessionToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    }) // per Shopify’s token exchange spec. :contentReference[oaicite:8]{index=8}

    // 4) Persist (idempotent)
    await upsertShopToken({
      shop_domain: shop,
      offline_access_token: resp.accessToken,
    })

    return NextResponse.json({ ok: true, shop })
  } catch (e) {
    // 5) Help yourself if anything goes wrong: expose reason during dev
    const detail = e?.response?.text
      ? await e.response.text()
      : (e?.message ?? String(e))
    return NextResponse.json(
      { error: 'exchange_failed', detail },
      { status: 400 }
    )
  }
}
