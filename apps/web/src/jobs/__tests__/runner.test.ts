import { describe, expect, it, vi, beforeEach } from 'vitest'
import { processNextWebhookJob, calculateBackoffMs } from '../runner'

const jobsMock = vi.hoisted(() => ({
  reserveSpy: vi.fn(),
  completeSpy: vi.fn(),
  retrySpy: vi.fn(),
  failSpy: vi.fn(),
}))

const gdprMock = vi.hoisted(() => ({
  parseSpy: vi.fn(),
  dispatchSpy: vi.fn(),
}))

vi.mock('@jazm/db/jobs', () => ({
  reserveNextWebhookJob: jobsMock.reserveSpy,
  completeWebhookJob: jobsMock.completeSpy,
  retryWebhookJob: jobsMock.retrySpy,
  failWebhookJob: jobsMock.failSpy,
}))

vi.mock('../gdpr', () => ({
  parseGdprJobPayload: gdprMock.parseSpy,
  dispatchGdprJob: gdprMock.dispatchSpy,
}))

const { reserveSpy, completeSpy, retrySpy, failSpy } = jobsMock
const { parseSpy, dispatchSpy } = gdprMock

const logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('processNextWebhookJob', () => {
  it('returns processed=false when queue is empty', async () => {
    reserveSpy.mockResolvedValueOnce(null)

    const result = await processNextWebhookJob({ now: new Date(), logger })

    expect(result).toEqual({ processed: false })
    expect(dispatchSpy).not.toHaveBeenCalled()
  })

  it('completes the job when handler succeeds', async () => {
    const now = new Date('2025-09-24T12:00:00Z')
    const jobPayload = {
      topic: 'customers_data_request',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
      payload: { ok: true },
    }
    reserveSpy.mockResolvedValueOnce({
      id: 'job-1',
      topic: 'customers_data_request',
      attempts: 1,
      payload: jobPayload,
      due_at: new Date(now.getTime() + 1000),
    })
    parseSpy.mockReturnValueOnce(jobPayload)
    dispatchSpy.mockResolvedValueOnce(undefined)

    const result = await processNextWebhookJob({ now, logger })

    expect(result).toEqual({ processed: true, outcome: 'completed' })
    expect(dispatchSpy).toHaveBeenCalledWith(jobPayload)
    expect(completeSpy).toHaveBeenCalledWith('job-1')
  })

  it('schedules retry when attempts remain', async () => {
    const now = new Date('2025-09-24T12:00:00Z')
    const jobPayload = {
      topic: 'customers_data_request',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
      payload: { ok: true },
    }
    reserveSpy.mockResolvedValueOnce({
      id: 'job-2',
      topic: 'customers_data_request',
      attempts: 1,
      payload: jobPayload,
      due_at: null,
    })
    parseSpy.mockReturnValueOnce(jobPayload)
    dispatchSpy.mockRejectedValueOnce(new Error('temporary failure'))

    const result = await processNextWebhookJob({ now, logger })

    expect(result).toEqual({ processed: true, outcome: 'retry' })
    expect(retrySpy).toHaveBeenCalledTimes(1)
    const call = retrySpy.mock.calls[0][0]
    expect(call.id).toBe('job-2')
    expect(call.nextRunAt.getTime()).toBe(now.getTime() + calculateBackoffMs(1))
    expect(failSpy).not.toHaveBeenCalled()
  })

  it('marks failure when attempts exhausted', async () => {
    const now = new Date('2025-09-24T12:00:00Z')
    const jobPayload = {
      topic: 'customers_data_request',
      shopDomain: 'demo.myshopify.com',
      webhookId: 'wh-1',
      eventId: 'evt-1',
      payload: { ok: true },
    }
    reserveSpy.mockResolvedValueOnce({
      id: 'job-3',
      topic: 'customers_data_request',
      attempts: 5,
      payload: jobPayload,
      due_at: null,
    })
    parseSpy.mockReturnValueOnce(jobPayload)
    dispatchSpy.mockRejectedValueOnce(new Error('permanent failure'))

    const result = await processNextWebhookJob({ now, logger })

    expect(result).toEqual({ processed: true, outcome: 'failed' })
    expect(failSpy).toHaveBeenCalledWith({
      id: 'job-3',
      error: expect.any(Error),
    })
    expect(retrySpy).not.toHaveBeenCalled()
  })
})

describe('calculateBackoffMs', () => {
  it('doubles delay with an upper bound', () => {
    expect(calculateBackoffMs(1)).toBe(10_000)
    expect(calculateBackoffMs(2)).toBe(20_000)
    expect(calculateBackoffMs(3)).toBe(40_000)
    expect(calculateBackoffMs(6)).toBe(300_000)
  })
})
