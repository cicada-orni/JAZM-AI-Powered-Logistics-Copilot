import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PW_PORT ?? 3000)
const HOST = process.env.PW_HOST ?? 'http://localhost'
const BASE = process.env.PW_BASE_URL ?? `${HOST}:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: BASE, // allows page.goto('/…')
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm build && pnpm start',
    url: `${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Ensure the meta renders during the build/runtime
    env: { NEXT_PUBLIC_SHOPIFY_API_KEY: 'test_key' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
