/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import { PolarisProvider } from '@/components/providers/PolarisProvider'
import '@shopify/polaris/build/esm/styles.css'
import BulkSyncModal from '@/components/app/BulkSyncModal'
import HostGuard from '@/components/app/HostGuard.client'
import AppNavMenu from '@/components/app/AppNavMenu'
import WebVitalsReporterAB from '@/components/providers/WebVitalsReporterAB.client'

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
        <HostGuard />
        <AppNavMenu />
        <WebVitalsReporterAB />
        <PolarisProvider>{children}</PolarisProvider>
        <BulkSyncModal />
      </body>
    </html>
  )
}
