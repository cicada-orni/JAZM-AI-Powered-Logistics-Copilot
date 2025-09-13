'use client'

import { useEffect } from 'react'

/**
 * A client component that attaches a listener to the Shopify App Bridge's
 * webVitals.onReport API. For development, this logs the metrics to the console.
 * Shopify automatically collects the real field metrics needed for BFS review.
 */
export default function WebVitalsReporterAB() {
  useEffect(() => {
    const anyWin = window
    const onReport = anyWin?.shopify?.webVitals?.onReport

    // Silently skip if App Bridge is not ready
    if (!onReport) return

    // Register a simple callback to log the metrics.
    // Ref: https://shopify.dev/docs/api/app-bridge/apis/web-vitals
    onReport((metric: { id: string; name: string; value: number }) => {
      // For developer feedback, we log the metric and enrich it with the page path.
      console.log('[AB Web Vitals]', { ...metric, path: location.pathname })
    })
  }, []) // The empty [] ensures this runs only once.

  // This component renders no visible UI.
  return null
}
