import { getAdminGraphQLClient } from '@/lib/admin-graphql'

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
  const respUnknown: unknown = await client.request(ACCESS_SCOPES_QUERY, {})

  if (respUnknown && typeof respUnknown === 'object' && 'data' in respUnknown) {
    const data = (respUnknown as { data: CurrentAppInstallationQuery }).data
    return data.currentAppInstallation?.accessScopes?.map((s) => s.handle) ?? []
  }

  throw new Error('Invalid GraphQL response shape in accessScopes check')
}
