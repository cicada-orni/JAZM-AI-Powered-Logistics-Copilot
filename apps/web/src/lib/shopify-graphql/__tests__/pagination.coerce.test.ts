import { describe, it, expect } from 'vitest'
import { coerceGraphQLResponse, type GraphQLResponse } from '../pagination'
import { isShopifyGraphQLRequestError } from '../errors'

describe('coerceGraphQLResponse', () => {
  it('returns data when payload contains data without errors', () => {
    const payload = { data: { hello: 'world' } }
    const result = coerceGraphQLResponse<typeof payload.data>(payload)
    expect(result.data.hello).toBe('world')
  })

  it('throws a typed error when errors are present', () => {
    const payload = {
      errors: {
        graphQLErrors: [
          { message: 'This app is not approved to access the Order object.' },
        ],
      },
    }
    try {
      coerceGraphQLResponse(payload)
      throw new Error('expected coerceGraphQLResponse to throw')
    } catch (err) {
      expect(isShopifyGraphQLRequestError(err)).toBe(true)
      if (isShopifyGraphQLRequestError(err)) {
        expect(err.kind).toBe('protected_customer_data')
      }
    }
  })

  it('throws for invalid payload shapes', () => {
    expect(() => coerceGraphQLResponse(null)).toThrowError(
      'Invalid GraphQL response shape'
    )
  })
})
