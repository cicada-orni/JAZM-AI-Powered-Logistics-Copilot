/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import { PolarisProvider } from '@/components/providers/PolarisProvider'
import { NavMenu } from '@shopify/app-bridge-react'
import '@shopify/polaris/build/esm/styles.css'

// METADATA
export const metadata: Metadata = {
  title: 'JAZM DASHBOARD',
  description: 'AI-Powered Logistics Copilot',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="shopify-api-key"
          content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}
        />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      </head>
      <body>
        <NavMenu>
          <a href="/" rel="home">
            JAZM Home
          </a>
          <a href="/">Dashboard</a>
          <a href="/analytics">Analytics</a>
          <a href="/products">Products</a>
          <a href="/customers">Customers</a>
          <a href="/notifications">Notifications</a>
          <a href="/settings">Settings</a>
        </NavMenu>
        <PolarisProvider>{children}</PolarisProvider>
      </body>
    </html>
  )
}
