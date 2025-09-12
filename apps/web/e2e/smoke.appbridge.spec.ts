// apps/web/e2e/smoke.appbridge.spec.ts
import { test, expect } from '@playwright/test'

const HOST = 'aHR0cHM6Ly9kZXYtbXlzaG9wLm15c2hvcGlmeS5jb20'
const SHOP = 'example-dev.myshopify.com'

test('App Bridge v4 bootstraps (script+meta) and no context error', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  await page.goto(`/?host=${HOST}&shop=${SHOP}`)

  // Script + meta present
  await expect(page.locator('head meta[name="shopify-api-key"]')).toHaveCount(1)
  await expect(
    page.locator('head script[src*="shopifycloud/app-bridge.js"]')
  ).toHaveCount(1)

  // Wait until App Bridge global is available in the page
  await page.waitForFunction(() => Boolean(window.shopify))

  // No v4 context errors
  expect(
    errors.filter((e) => /No AppBridge context provided/i.test(e))
  ).toHaveLength(0)
})
