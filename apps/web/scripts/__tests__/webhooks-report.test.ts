import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@jazm/db/analytics', () => ({
  getWebhookDeliveryMetrics: vi.fn(),
  getWebhookJobMetrics: vi.fn(),
}))

const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
const tableSpy = vi.spyOn(console, 'table').mockImplementation(() => {})

afterEach(() => {
  delete process.env.WEBHOOKS_REPORT_DRY_RUN
  vi.resetAllMocks()
})

describe('webhooks-report script', () => {
  it('prints mock data in dry-run mode', async () => {
    process.env.WEBHOOKS_REPORT_DRY_RUN = '1'
    const webhook_module = await import('../webhooks-report')
    expect(webhook_module).toBeDefined()

    expect(infoSpy).toHaveBeenCalledWith(
      '[webhooks-report] Running in dry-run mode'
    )
    expect(tableSpy).toHaveBeenCalledTimes(2)
  })
})
