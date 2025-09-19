import { getAdminGraphQLClient } from '@/lib/admin-graphql'
import {
  classifyGraphQLError,
  createShopifyGraphQLRequestError,
  type ShopifyGraphQLResponseErrors,
} from './errors'

type Maybe<T> = T | null | undefined

type PageInfo = {
  hasNextPage: boolean
  endCursor: Maybe<string>
}

type ThrottleStatus = {
  maximumAvailable: number
  currentlyAvailable: number
  restoreRate: number
}

type Cost = {
  requestedQueryCost: number
  actualQueryCost: number
  throttleStatus: ThrottleStatus
}

type GraphQLExtensions = {
  cost?: Cost
}

export type GraphQLResponse<TData> = {
  data: TData
  extensions?: GraphQLExtensions
}

type GraphQLClientError = {
  message?: string
}

type GraphQLResponseErrors = {
  message?: string
  graphQLErrors?: GraphQLClientError[]
  networkStatusCode?: number
}

type ShopifyGraphQLClientResponse<TData> = {
  data?: TData
  extensions?: GraphQLExtensions
  errors?: GraphQLResponseErrors
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// function getGraphQLErrorMessage(input: unknown): string | undefined {
//   if (!Array.isArray(input)) return undefined
//   for (const err of input) {
//     if (
//       isObject(err) &&
//       typeof err.message === 'string' &&
//       err.message.trim()
//     ) {
//       return err.message
//     }
//   }
//   return undefined
// }

// function formatGraphQLError(errors: GraphQLResponseErrors): string {
//   const parts: string[] = []
//   if (errors.message) parts.push(errors.message)
//   const firstGraphQLError = getGraphQLErrorMessage(errors.graphQLErrors)
//   if (firstGraphQLError) parts.push(firstGraphQLError)
//   if (!parts.length && errors.networkStatusCode) {
//     parts.push(`Shopify Admin API error (status ${errors.networkStatusCode})`)
//   }
//   if (!parts.length) {
//     parts.push('Shopify Admin API error')
//   }
//   return parts.join(': ')
// }

export function coerceGraphQLResponse<TData>(
  payload: unknown
): GraphQLResponse<TData> {
  if (!isObject(payload)) {
    throw new Error('Invalid GraphQL response shape')
  }

  const candidate = payload as {
    data?: TData
    extensions?: GraphQLExtensions
    errors?: ShopifyGraphQLResponseErrors
  }

  if (candidate.errors) {
    const classified = classifyGraphQLError(candidate.errors)
    throw createShopifyGraphQLRequestError(classified)
  }

  if (candidate.data === undefined || candidate.data === null) {
    throw new Error('GraphQL response missing data')
  }

  return {
    data: candidate.data,
    extensions: candidate.extensions,
  }
}

export type IterateOptions = {
  pageSize?: number // default 100
  maxPages?: number // default 50
  maxMs?: number // default 60_000
  onPage?: (info: {
    page: number
    items: number
    endCursor: Maybe<string>
    cost?: Cost
    elapsedMs: number
  }) => void
}

export type ConnectionLike<TNode> = {
  edges: Array<{ node: TNode }>
  pageInfo: PageInfo
}

export type ConnectionSelector<TData, TNode> = (
  data: TData
) => ConnectionLike<TNode>

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

function computeBackoffMs(cost?: Cost): number {
  if (!cost) return 0

  const { requestedQueryCost, throttleStatus } = cost
  const { currentlyAvailable, restoreRate } = throttleStatus

  // If we have enough credits, no backoff.
  if (requestedQueryCost <= currentlyAvailable) return 0

  const deficit = requestedQueryCost - currentlyAvailable
  // restoreRate is credits per second; jitter (100–300 ms).
  const seconds = Math.ceil(deficit / Math.max(1, restoreRate))
  const jitter = 100 + Math.floor(Math.random() * 200)
  return seconds * 1000 + jitter
}

// Execute a single page query against the Admin GraphQL API for a given shop.
async function requestPage<TData>(
  shopDomain: string,
  query: string,
  variables: Record<string, unknown>
): Promise<GraphQLResponse<TData>> {
  const client = await getAdminGraphQLClient(shopDomain)
  // @shopify/admin-api-client .request returns { data, extensions, errors? }
  const respUnknown: unknown = await client.request(query, { variables })
  return coerceGraphQLResponse<TData>(respUnknown)
}

export async function* iterateConnection<TNode, TData>(
  shopDomain: string,
  query: string,
  select: ConnectionSelector<TData, TNode>,
  opts: IterateOptions = {}
): AsyncGenerator<TNode[]> {
  // Enforce Shopify page-size cap (≤ 250)
  const pageSize = Math.min(250, Math.max(1, opts.pageSize ?? 100))
  const maxPages = opts.maxPages ?? 50
  const maxMs = opts.maxMs ?? 60_000

  let page = 0
  let cursor: Maybe<string> = null
  const start = Date.now()

  while (true) {
    page += 1
    if (page > maxPages) break
    if (Date.now() - start > maxMs) break

    const variables = { first: pageSize, after: cursor }
    const resp = await requestPage<TData>(shopDomain, query, variables)

    const connection = select(resp.data)
    const nodes = connection.edges.map((e) => e.node)
    const info = connection.pageInfo

    opts.onPage?.({
      page,
      items: nodes.length,
      endCursor: info.endCursor ?? null,
      cost: resp.extensions?.cost,
      elapsedMs: Date.now() - start,
    })

    if (nodes.length > 0) {
      yield nodes
    }

    if (!info.hasNextPage || !info.endCursor) break
    cursor = info.endCursor

    const backoff = computeBackoffMs(resp.extensions?.cost)
    if (backoff > 0) {
      await sleep(backoff)
    }
  }
}

// Helper to collect all nodes
export async function collectAll<TNode, TData>(
  shopDomain: string,
  query: string,
  select: ConnectionSelector<TData, TNode>,
  opts: IterateOptions = {}
): Promise<TNode[]> {
  const out: TNode[] = []
  for await (const batch of iterateConnection<TNode, TData>(
    shopDomain,
    query,
    select,
    opts
  )) {
    out.push(...batch)
  }
  return out
}
