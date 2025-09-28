import { beforeEach, describe, it, expect, vi } from 'vitest'
import {
  logWebhookDelivery,
  logWebhookJobEvent,
  logWebhookError,
} from '../webhooks'
import { SHOPIFY_ADMIN_API_VERSION } from '@/config/shopifyApiVersion'

const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('logWebhookDelivery', () => {
  it('emits structured JSON for deliveries', () => {
    logWebhookDelivery({
      handler: 'gdpr',
      topic: 'customers/redact',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
      apiVersion: SHOPIFY_ADMIN_API_VERSION,
      duplicate: false,
      latencyMs: 42,
      jobId: 'job-123',
    })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(infoSpy.mock.calls[0][0] as string)
    expect(payload).toMatchObject({
      event: 'webhook.delivery',
      handler: 'gdpr',
      topic: 'customers/redact',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
      apiVersion: SHOPIFY_ADMIN_API_VERSION,
      jobId: 'job-123',
      duplicate: false,
      latencyMs: 42,
    })
  })
})

describe('logWebhookError', () => {
  it('logs errors through console.error', () => {
    logWebhookError({
      handler: 'gdpr',
      topic: 'customers/data_request',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
      error: new Error('Boom'),
    })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(errorSpy.mock.calls[0][0] as string)
    expect(payload).toMatchObject({
      event: 'webhook.delivery.error',
      handler: 'gdpr',
      message: 'Boom',
    })
  })
})

describe('logWebhookJobEvent', () => {
  it('routes retry outcomes through console.warn', () => {
    logWebhookJobEvent({
      outcome: 'retry',
      jobId: 'job-42',
      topic: 'customers_redact',
      attempts: 2,
      nextRunAt: new Date('2025-09-24T12:05:00Z'),
      message: 'temporary failure',
    })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(warnSpy.mock.calls[0][0] as string)
    expect(payload).toMatchObject({
      event: 'webhook.job',
      outcome: 'retry',
      jobId: 'job-42',
      attempts: 2,
      message: 'temporary failure',
    })
  })

  it('routes failures through console.error', () => {
    logWebhookJobEvent({
      outcome: 'failed',
      jobId: 'job-42',
      topic: 'shop_redact',
      attempts: 5,
      message: 'fatal',
    })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(errorSpy.mock.calls[0][0] as string)
    expect(payload).toMatchObject({
      event: 'webhook.job',
      outcome: 'failed',
      jobId: 'job-42',
      message: 'fatal',
    })
  })
})
