import { NextResponse } from 'next/server'
import { shopify } from '@/lib/shopify'
import { upsertShopToken } from '@jazm/db/shopTokens'
import { RequestedTokenType } from '@shopify/shopify-api'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const sessionToken = authHeader.replace('Bearer ', '')
    if (!sessionToken) {
      return new Response('Missing Session Token', { status: 401 })
    }

    const decoded = await shopify.session.decodeSessionToken(sessionToken)
    const { dest: shopUrl } = decoded
    const shopDomain = new URL(shopUrl).hostname

    const exchanged = shopify.auth.tokenExchange({
      shop: shopDomain,
      sessionToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    })

    const { accessToken } = exchanged
    await upsertShopToken({ shopDomain, offlineAccessToken: accessToken! })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Token exchange failed:', error)
    return new Response('Token exchange failed', { status: 500 })
  }
}
