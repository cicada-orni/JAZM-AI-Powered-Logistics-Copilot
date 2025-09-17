import { getAdminGraphQLClient } from '@/lib/admin-graphql'
import { coerceGraphQLResponse } from './pagination'

type AccessScope = { handle: string }

type CurrentAppInstallationQuery = {
  currentAppInstallation: {
    accessScopes: AccessScope[]
  }
}

const ACCESS_SCOPES_QUERY = `#graphql
  query CurrentAppInstallationScopes {
    currentAppInstallation { accessScopes { handle } }
  }
`

export async function getGrantedAccessScopes(
  shopDomain: string
): Promise<string[]> {
  const client = await getAdminGraphQLClient(shopDomain)
  const { data } = coerceGraphQLResponse<CurrentAppInstallationQuery>(
    await client.request(ACCESS_SCOPES_QUERY, {})
  )

  return data.currentAppInstallation?.accessScopes?.map((s) => s.handle) ?? []
}
