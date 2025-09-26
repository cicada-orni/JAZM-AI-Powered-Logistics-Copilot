import { WebhookJobTopic } from '@jazm/db/jobs'
import { markShopRedacted } from '@jazm/db/webhooks'
import type { Prisma, InputJsonValue } from '@jazm/db/types'
import type {
  CustomersDataRequestJob,
  CustomersRedactJob,
  ShopRedactJob,
  GdprJobTopic,
  PlannedGdprJob,
  GdprJobBody,
} from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

type JsonRecord = Record<string, Prisma.JsonValue>

function asRecord(value: Prisma.JsonValue): JsonRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid GDPR job payload')
  }
  return value as JsonRecord
}

function requireString(record: JsonRecord, key: string): string {
  const candidate = record[key]
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate
  }
  throw new Error(`GDPR job payload missing ${key}`)
}

function extractPayload(record: JsonRecord): InputJsonValue {
  const payload = record.payload as Prisma.JsonValue | undefined
  return (payload ?? null) as InputJsonValue
}

export function planGdprJob(params: {
  topic: string
  shop: string
  webhookId: string
  eventId: string
  payload: InputJsonValue
  receivedAt: Date
}): PlannedGdprJob {
  const base = {
    shopDomain: params.shop,
    webhookId: params.webhookId,
    eventId: params.eventId,
    payload: params.payload,
  }

  if (params.topic === 'customers/data_request') {
    const job: CustomersDataRequestJob = {
      topic: 'customers_data_request',
      ...base,
    }
    return {
      job,
      dueAt: new Date(params.receivedAt.getTime() + THIRTY_DAYS_MS),
    }
  }

  if (params.topic === 'customers/redact') {
    const job: CustomersRedactJob = {
      topic: 'customers_redact',
      ...base,
    }
    return {
      job,
      dueAt: new Date(params.receivedAt.getTime() + THIRTY_DAYS_MS),
    }
  }

  const job: ShopRedactJob = {
    topic: 'shop_redact',
    ...base,
  }
  return {
    job,
    dueAt: new Date(params.receivedAt.getTime() + FORTY_EIGHT_HOURS_MS),
  }
}

export function toWebhookJobTopic(topic: GdprJobTopic): WebhookJobTopic {
  switch (topic) {
    case 'customers_data_request':
      return 'customers_data_request'
    case 'customers_redact':
      return 'customers_redact'
    case 'shop_redact':
    default:
      return 'shop_redact'
  }
}

export function parseGdprJobPayload(payload: Prisma.JsonValue): GdprJobBody {
  const record = asRecord(payload)
  const topic = record.topic

  if (topic === 'customers_data_request') {
    return {
      topic,
      shopDomain: requireString(record, 'shopDomain'),
      webhookId: requireString(record, 'webhookId'),
      eventId: requireString(record, 'eventId'),
      payload: extractPayload(record),
    }
  }

  if (topic === 'customers_redact') {
    return {
      topic,
      shopDomain: requireString(record, 'shopDomain'),
      webhookId: requireString(record, 'webhookId'),
      eventId: requireString(record, 'eventId'),
      payload: extractPayload(record),
    }
  }

  if (topic === 'shop_redact') {
    return {
      topic,
      shopDomain: requireString(record, 'shopDomain'),
      webhookId: requireString(record, 'webhookId'),
      eventId: requireString(record, 'eventId'),
      payload: extractPayload(record),
    }
  }

  throw new Error(`Unsupported GDPR job topic: ${String(topic)}`)
}

const HANDLERS: {
  [Topic in GdprJobTopic]: (
    job: Extract<GdprJobBody, { topic: Topic }>
  ) => Promise<void>
} = {
  customers_data_request: handleCustomersDataRequest,
  customers_redact: handleCustomersRedact,
  shop_redact: handleShopRedact,
}

export async function dispatchGdprJob(job: GdprJobBody) {
  const handler = HANDLERS[job.topic]
  await handler(job as never)
}

export async function handleCustomersDataRequest(
  job: CustomersDataRequestJob
) {
  console.info('[gdpr] staged data request job', { job })
}

export async function handleCustomersRedact(job: CustomersRedactJob) {
  console.info('[gdpr] customer redact placeholder', { job })
}

export async function handleShopRedact(job: ShopRedactJob) {
  await markShopRedacted(job.shopDomain)
  console.info('[gdpr] shop redacted', { job })
}
