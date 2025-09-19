import { iterateConnection, type ConnectionLike, type IterateOptions } from './pagination'

// Types matching the shape we select in the query below
export type OrderNode = {
  id: string
  name: string
  processedAt: string
}

export type OrdersConnection = ConnectionLike<OrderNode>

// Keep fields tight; add more only when needed. Cap page size via iterator.
const ORDERS_PAGE_QUERY = `#graphql
  query OrdersPage($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: UPDATED_AT) {
      edges {
        node {
          id
          name
          processedAt
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

export async function* listRecentPaidOrders(
  shopDomain: string,
  opts: IterateOptions = {}
) {
  type TData = { orders: OrdersConnection }
  const select = (data: TData) => data.orders
  for await (const batch of iterateConnection<OrderNode, TData>(
    shopDomain,
    ORDERS_PAGE_QUERY,
    select,
    opts
  )) {
    yield batch
  }
}
