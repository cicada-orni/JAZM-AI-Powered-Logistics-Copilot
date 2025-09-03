'use client'
import { useEffect, useState } from 'react'
import createApp from '@shopify/app-bridge'
import { getSessionToken } from '@shopify/app-bridge/utilities'

export function AuthInit() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // 1) Host is required by App Bridge; read it from the URL
        const params = new URLSearchParams(window.location.search)
        const host = params.get('host') || sessionStorage.getItem('shopifyHost')
        if (!host) throw new Error('missing_host')
        sessionStorage.setItem('shopifyHost', host)

        const app = createApp({
          apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!, // public key
          host, // base64 shop+host from Admin
          forceRedirect: true,
        })

        // 3) Get a fresh **session token** (ID token) from App Bridge
        const idToken = await getSessionToken(app) // Promise<string>

        // 4) Call your backend (Vercel) with the token
        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
        })

        if (!cancelled) setStatus(res.ok ? 'ok' : 'err')
      } catch {
        if (!cancelled) setStatus('err')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return <div style={{ padding: 16 }}>Auth bootstrap: {status}</div>
}
