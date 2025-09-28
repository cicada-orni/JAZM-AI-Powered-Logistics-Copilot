import type { InputJsonValue } from '@jazm/db/types'

type JsonObject = { [key: string]: InputJsonValue }

export type GdprJobTopic =
  | 'customers_data_request'
  | 'customers_redact'
  | 'shop_redact'

export type CustomersDataRequestJob = JsonObject & {
  topic: 'customers_data_request'
  shopDomain: string
  webhookId: string
  eventId: string
  payload: InputJsonValue
}

export type CustomersRedactJob = JsonObject & {
  topic: 'customers_redact'
  shopDomain: string
  webhookId: string
  eventId: string
  payload: InputJsonValue
}

export type ShopRedactJob = JsonObject & {
  topic: 'shop_redact'
  shopDomain: string
  webhookId: string
  eventId: string
  payload: InputJsonValue
}

export type GdprJobBody =
  | CustomersDataRequestJob
  | CustomersRedactJob
  | ShopRedactJob

export type PlannedGdprJob = {
  job: GdprJobBody
  dueAt: Date
}
