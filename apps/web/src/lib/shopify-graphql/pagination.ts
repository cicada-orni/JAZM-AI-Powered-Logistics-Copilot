// import { getAdminGraphQLClient } from '@/lib/admin-graphql'
// import { GraphqlClient } from '@shopify/shopify-api'

// type Maybe<T> = T | null | undefined

// type PageInfo = {
//   hasNextPage: boolean
//   endCursor: Maybe<string>
// }

// type ThrottleStatus = {
//   maximumAvailable: number
//   currentlyAvailable: number
//   restoreRate: number
// }

// type Cost = {
//   requestedQueryCost: number
//   actualQueryCost: number
//   throttleStatus: ThrottleStatus
// }

// type GraphQLExtensions = {
//   cost?: Cost
// }

// export type GraphQLResponse<TData> = {
//   data: TData
//   extensions?: GraphQLExtensions
// }

// export type IterateOptions = {
//   pageSize?: number // default 100
//   maxPages?: number // default 50
//   maxMs?: number // default 60_000
//   onPage?: (info: {
//     page: number
//     items: number
//     endCursor: Maybe<string>
//     cost?: Cost
//     elapsedMs: number
//   }) => void
// }

// export type ConnectionLike<TNode> = {
//   edges: Array<{ node: TNode }>
//   pageInfo: PageInfo
// }

// export type ConnectionSelector<TData, TNode> = (
//   data: TData
// ) => ConnectionLike<TNode>

// function sleep(ms: number) {
//   return new Promise((res) => setTimeout(res, ms))
// }

// function computeBackoofMs(cost?: Cost): number {
//   if (!cost) return 0

//   const { requestedQueryCost, throttleStatus } = cost
//   const { currentlyAvailable, restoreRate } = throttleStatus
//   if (requestedQueryCost <= currentlyAvailable) return 0

//   const deficet = requestedQueryCost - currentlyAvailable
//   const seconds = Math.ceil(deficet / Math.max(1, restoreRate))
//   const jitter = 100 + Math.floor(Math.random() * 200)
//   return seconds * 1000 + jitter
// }

// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// async function requestPage<TData>(
//   shopDomain: string,
//   query: string,
//   variables: Record<string, any>
// ): Promise<GraphQLResponse<TData>> {
//   const client = await getAdminGraphQLClient(shopDomain)
//   // @shopify/admin-api-client .request returns { data, extensions, errors? }
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const resp: any = await client.request(query, variables)
//   return resp as GraphQLResponse<TData>
// }
