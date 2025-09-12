import { test, expect } from '@playwright/test'

const HOST = 'aHR0cHM6Ly9kZXYtbXlzaG9wLm15c2hvcGlmeS5jb20'
const SHOP = 'example-dev.myshopify.com'

test('HostGuard injects host (& shop) into URL when missing', async ({
  page,
}) => {
  // Prime sessionStorage *before* navigation
  await page.addInitScript(
    ([h, s]) => {
      try {
        sessionStorage.setItem('jazm.host', h)
        sessionStorage.setItem('jazm.shop', s)
      } catch {}
    },
    [HOST, SHOP]
  )

  // Navigate *without* host/shop in query
  await page.goto(`/`)

  // Expect HostGuard to normalize URL by adding them
  await expect
    .poll(async () => new URL(page.url()).searchParams.get('host'))
    .toBe(HOST)

  await expect
    .poll(async () => new URL(page.url()).searchParams.get('shop'))
    .toBe(SHOP)
})
