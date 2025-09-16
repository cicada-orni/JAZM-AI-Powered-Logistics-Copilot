import {
  iterateConnection,
  type IterateOptions,
  type ConnectionLike,
} from './pagination'

export type ProductNode = {
  id: string
  title: string
  handle: string
  status: string
  updatedAt: string
}

export type ProductsConnection = ConnectionLike<ProductNode>

const PRODUCTS_PAGE_QUERY = `#graphql
  query ProductsPage($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT) {
      edges {
        node {
          id
          title
          handle
          status
          updatedAt
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

export async function* listRecentProducts(
  shopDomain: string,
  opts: IterateOptions = {}
) {
  type TData = { products: ProductsConnection }
  const select = (data: TData) => data.products
  for await (const batch of iterateConnection<ProductNode, TData>(
    shopDomain,
    PRODUCTS_PAGE_QUERY,
    select,
    opts
  )) {
    yield batch
  }
}
