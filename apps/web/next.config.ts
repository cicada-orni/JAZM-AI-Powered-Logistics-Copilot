import type { NextConfig } from 'next'

// apps/web/next.config.ts
const nextConfig: NextConfig = {
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
