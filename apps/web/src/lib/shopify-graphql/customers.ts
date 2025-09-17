import { iterateConnection, type ConnectionLike, type IterateOptions } from './pagination'

export type CustomerNode = {
  id: string
  displayName?: string | null
}

export type CustomersConnection = ConnectionLike<CustomerNode>

const CUSTOMERS_PAGE_QUERY = `#graphql
  query CustomersPage($first: Int!, $after: String) {
    customers(first: $first, after: $after, sortKey: UPDATED_AT) {
      edges {
        node {
          id
          displayName
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

export async function* listRecentCustomers(
  shopDomain: string,
  opts: IterateOptions = {}
) {
  type TData = { customers: CustomersConnection }
  const select = (data: TData) => data.customers
  for await (const batch of iterateConnection<CustomerNode, TData>(
    shopDomain,
    CUSTOMERS_PAGE_QUERY,
    select,
    opts
  )) {
    yield batch
  }
}
