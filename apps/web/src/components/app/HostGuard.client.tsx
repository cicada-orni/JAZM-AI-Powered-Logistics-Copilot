'use client'
import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  getStoredHost,
  setStoredHost,
  getStoredShop,
  setStoredShop,
} from '@/lib/host'

export default function HostGuard() {
  const pathname = usePathname()
  const router = useRouter()
  const params = useSearchParams()

  const urlHost = params.get('host')
  const urlShop = params.get('shop')

  useEffect(() => {
    const storedHost = getStoredHost()
    const storedShop = getStoredShop()

    if (urlHost) setStoredHost(urlHost)
    if (urlShop) setStoredShop(urlShop)

    const host = urlHost ?? storedHost
    const shop = urlShop ?? storedShop

    if (urlHost) return

    if (host) {
      const search = new URLSearchParams(params.toString())
      if (!search.get('host')) search.set('host', host)
      if (shop && !search.get('shop')) search.set('shop', shop)
      router.replace(`${pathname}?${search.toString()}`)
    }
  }, [pathname, router, params, urlHost, urlShop])

  return null
}
