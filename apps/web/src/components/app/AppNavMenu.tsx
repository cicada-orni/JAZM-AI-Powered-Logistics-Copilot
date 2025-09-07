'use client'
import { NavMenu } from '@shopify/app-bridge-react'
import { useSearchParams } from 'next/navigation'
import { ROUTES } from '@/config/nav'
import { getStoredHost, getStoredShop, withHostParams } from '@/lib/host'

export default function AppNavMenu() {
  const params = useSearchParams()
  const host = params.get('host') ?? getStoredHost()
  const shop = params.get('shop') ?? getStoredShop()

  if (!host) return null
  const href = (path: string) => withHostParams(path, host, shop)
  return (
    <NavMenu>
      <a rel="home" href={ROUTES.home.path}>
        {ROUTES.home.label}
      </a>
      <a href={href(ROUTES.dashboard.path)}>{ROUTES.dashboard.label}</a>
      <a href={href(ROUTES.analytics.path)}>{ROUTES.analytics.label}</a>
      <a href={href(ROUTES.products.path)}>{ROUTES.products.label}</a>
      <a href={href(ROUTES.customers.path)}>{ROUTES.customers.label}</a>
      <a href={href(ROUTES.notifications.path)}>{ROUTES.notifications.label}</a>
      <a href={href(ROUTES.settings.path)}>{ROUTES.settings.label}</a>
    </NavMenu>
  )
}
