import type { NextConfig } from 'next'
import path from 'node:path'
// apps/web/next.config.ts

const monorepoRoot = path.join(__dirname, '..', '..')

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot, // tell Turbopack the true repo root
  },
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@jazm/db'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Allow embedding only inside Shopify Admin
          {
            key: 'Content-Security-Policy',
            value:
              'frame-ancestors https://admin.shopify.com https://*.myshopify.com',
          },
        ],
      },
    ]
  },
}
export default nextConfig
