import { getAdminGraphQLClient } from '@/lib/admin-graphql'

type BulkStatus = 'CREATED' | 'RUNNING' | 'CANCELLED' | 'COMPLETED' | 'FAILED'

export type CurrentBulkOperation = {
  id: string
  status: BulkStatus
  errorCode?: string | null
  createdAt: string
  completedAt?: string | null
  objectCount?: string | null
  fileSize?: string | null
  url?: string | null
  partialDataUrl?: string | null
}

// Start a bulk read with a GraphQL document string
export async function startBulkQuery(
  shopDomain: string,
  bulkQuery: string
): Promise<{ id: string; status: BulkStatus }> {
  const client = await getAdminGraphQLClient(shopDomain)
  const request = (client as unknown as {
    request: (doc: string, vars?: Record<string, unknown>) => Promise<unknown>
  }).request
  const BULK_RUN = `#graphql
    mutation BulkRunQuery($query: String!) {
      bulkOperationRunQuery(query: $query) {
        bulkOperation { id status }
        userErrors { field message }
      }
    }
  `
  const respUnknown: unknown = await request(BULK_RUN, { query: bulkQuery })
  if (isObject(respUnknown) && 'data' in respUnknown && isObject((respUnknown as Record<string, unknown>).data)) {
    const dataObj = (respUnknown as Record<string, unknown>).data as Record<string, unknown>
    const res = dataObj.bulkOperationRunQuery as
      | {
          bulkOperation?: { id: string; status: BulkStatus } | null
          userErrors?: Array<{ field?: string[] | null; message: string }>
        }
      | undefined
    if (res?.userErrors && res.userErrors.length > 0) {
      const msg = res.userErrors.map((e) => e.message).join('; ')
      throw new Error(`Bulk run query returned userErrors: ${msg}`)
    }
    if (!res?.bulkOperation)
      throw new Error('Bulk run query returned no bulkOperation')
    return res.bulkOperation
  }
  throw new Error('Invalid GraphQL response shape for bulkOperationRunQuery')
}

// Poll current bulk operation until terminal status or timeout

export async function pollCurrentBulk(
  shopDomain: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<CurrentBulkOperation> {
  const client = await getAdminGraphQLClient(shopDomain)
  const request = (client as unknown as {
    request: (doc: string, vars?: Record<string, unknown>) => Promise<unknown>
  }).request
  const intervalMs = Math.max(1000, opts.intervalMs ?? 3000)
  const timeoutMs = Math.max(5000, opts.timeoutMs ?? 120_000)
  const start = Date.now()
  const CURRENT_BULK = `#graphql
        query CurrentBulk {
            currentBulkOperation{
                id
                status
                errorCode
                createdAt
                completedAt
                objectCount
                fileSize
                url
                partialDataUrl
            }
        }
    `
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const respUnknown: unknown = await request(CURRENT_BULK, {})
    if (isObject(respUnknown) && 'data' in respUnknown && isObject((respUnknown as Record<string, unknown>).data)) {
      const dataObj = (respUnknown as Record<string, unknown>).data as Record<string, unknown>
      const opVal = dataObj.currentBulkOperation
      const op = toCurrentBulkOperation(opVal)
      if (
        op &&
        (op.status === 'COMPLETED' ||
          op.status === 'FAILED' ||
          op.status === 'CANCELLED')
      ) {
        return op
      }
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for currentBulkOperation')
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

// Type guards
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isBulkStatus(v: unknown): v is BulkStatus {
  return (
    v === 'CREATED' ||
    v === 'RUNNING' ||
    v === 'CANCELLED' ||
    v === 'COMPLETED' ||
    v === 'FAILED'
  )
}

function toCurrentBulkOperation(val: unknown): CurrentBulkOperation | null {
  if (!isObject(val)) return null
  const id = (val as Record<string, unknown>).id
  const status = (val as Record<string, unknown>).status
  const createdAt = (val as Record<string, unknown>).createdAt
  if (typeof id !== 'string' || typeof status !== 'string' || typeof createdAt !== 'string' || !isBulkStatus(status)) {
    return null
  }
  const getStr = (k: string): string | null => {
    const v = (val as Record<string, unknown>)[k]
    return typeof v === 'string' ? v : null
  }
  return {
    id,
    status,
    createdAt,
    errorCode: getStr('errorCode'),
    completedAt: getStr('completedAt'),
    objectCount: getStr('objectCount'),
    fileSize: getStr('fileSize'),
    url: getStr('url'),
    partialDataUrl: getStr('partialDataUrl'),
  }
}
