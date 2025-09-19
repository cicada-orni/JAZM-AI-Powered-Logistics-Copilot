import { getAdminGraphQLClient } from '@/lib/admin-graphql'
import { coerceGraphQLResponse } from './pagination'

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
  const BULK_RUN = `#graphql
  mutation BulkRunQuery($query: String!) {
    bulkOperationRunQuery(query: $query) {
      bulkOperation { id status }
      userErrors { field message }
    }
  }
  `
  const client = await getAdminGraphQLClient(shopDomain)
  const { data } = coerceGraphQLResponse<{
    bulkOperationRunQuery?: {
      bulkOperation?: { id: string; status: BulkStatus } | null
      userErrors?: Array<{ field?: string[] | null; message: string }>
    }
  }>(
    await client.request(BULK_RUN, { variables: { query: bulkQuery } })
  )

  const result = data.bulkOperationRunQuery
  if (result?.userErrors?.length) {
    const msg = result.userErrors.map((err) => err.message).join('; ')
    throw new Error(`Bulk run query returned userErrors: ${msg}`)
  }
  if (!result?.bulkOperation) {
    throw new Error('Bulk run query returned no bulkOperation')
  }
  return result.bulkOperation
}

// Poll current bulk operation until terminal status or timeout

export async function pollCurrentBulk(
  shopDomain: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<CurrentBulkOperation> {
  const client = await getAdminGraphQLClient(shopDomain)
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
    const { data } = coerceGraphQLResponse<{
      currentBulkOperation: CurrentBulkOperation | null
    }>(await client.request(CURRENT_BULK, { variables: {} }))

    const op = toCurrentBulkOperation(data.currentBulkOperation)
    if (
      op &&
      (op.status === 'COMPLETED' || op.status === 'FAILED' || op.status === 'CANCELLED')
    ) {
      return op
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
  if (
    typeof id !== 'string' ||
    typeof status !== 'string' ||
    typeof createdAt !== 'string' ||
    !isBulkStatus(status)
  ) {
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
