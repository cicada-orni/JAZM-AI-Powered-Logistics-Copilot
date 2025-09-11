'use client'
import { useEffect, useState } from 'react'

export function AuthInit() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const idToken = await window.shopify.idToken() //
        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
        })

        if (!cancelled) setDone(res.ok)
      } catch {
        if (!cancelled) setDone(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
