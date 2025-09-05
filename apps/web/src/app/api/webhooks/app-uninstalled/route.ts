import { NextResponse } from 'next/server'
import { markUninstalled } from '@jazm/db/shopTokens'

export async function POST(req: Request) {
  const shopDomain = req.headers.get('x-shopify-shop-domain')

  if (shopDomain) {
    await markUninstalled(shopDomain)
  }

  return NextResponse.json({ ok: true })
}
