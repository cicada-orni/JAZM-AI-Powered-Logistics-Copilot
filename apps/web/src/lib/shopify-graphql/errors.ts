export type ShopifyGraphQLErrorKind =
  | 'protected_customer_data'
  | 'missing_scope'
  | 'throttled'
  | 'unknown'

export type ShopifyGraphQLErrorPayload = {
  message?: string
  extensions?: {
    code?: string
    documentation?: string
  }
}

export type ShopifyGraphQLResponseErrors = {
  message?: string
  graphQLErrors?: ShopifyGraphQLErrorPayload[]
  networkStatusCode?: number
}

const PCD_PATTERNS = [
  'protected-customer-data',
  'not approved to access the Order object',
]

const MISSING_SCOPE_PATTERNS = [
  'missing access scope',
  'access denied for scope',
]

const THROTTLE_CODES = new Set([
  'THROTTLED',
  'MAX_COST_EXCEEDED',
  'THROTTLED_OVER_LIMIT',
])

function toLower(value?: string) {
  return value?.toLowerCase() ?? ''
}

function matchPattern(message: string, patterns: string[]) {
  const lower = toLower(message)
  return patterns.some((pattern) => lower.includes(toLower(pattern)))
}

export function classifyGraphQLError(errors: ShopifyGraphQLResponseErrors): {
  kind: ShopifyGraphQLErrorKind
  message: string
  docsUrl?: string
} {
  const fallback =
    errors.message?.trim() || 'Shopify Admin API error (no message provided)'
  const first = errors.graphQLErrors?.find(
    (err) => err && (err.message || err.extensions?.code)
  )

  const message = first?.message?.trim() || fallback
  const code = first?.extensions?.code

  if (code && THROTTLE_CODES.has(code)) {
    return { kind: 'throttled', message }
  }

  if (matchPattern(message, PCD_PATTERNS)) {
    return {
      kind: 'protected_customer_data',
      message,
      docsUrl: 'https://shopify.dev/docs/apps/launch/protected-customer-data',
    }
  }

  if (matchPattern(message, MISSING_SCOPE_PATTERNS)) {
    return { kind: 'missing_scope', message }
  }

  return { kind: 'unknown', message }
}

export type ShopifyGraphQLRequestError = Error & {
  kind: ShopifyGraphQLErrorKind
  docsUrl?: string
}

export function createShopifyGraphQLRequestError(args: {
  kind: ShopifyGraphQLErrorKind
  message: string
  docsUrl?: string
}): ShopifyGraphQLRequestError {
  const error = new Error(args.message) as ShopifyGraphQLRequestError
  error.name = 'ShopifyGraphQLRequestError'
  error.kind = args.kind
  error.docsUrl = args.docsUrl
  return error
}

export function isShopifyGraphQLRequestError(
  error: unknown
): error is ShopifyGraphQLRequestError {
  return (
    error instanceof Error &&
    (error as Partial<ShopifyGraphQLRequestError>).name ===
      'ShopifyGraphQLRequestError' &&
    typeof (error as Partial<ShopifyGraphQLRequestError>).kind === 'string'
  )
}
