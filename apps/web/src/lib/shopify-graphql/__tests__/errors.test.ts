import { describe, it, expect } from 'vitest'
import {
  classifyGraphQLError,
  createShopifyGraphQLRequestError,
  isShopifyGraphQLRequestError,
  type ShopifyGraphQLResponseErrors,
} from '../errors'

describe('classifyGraphQLError', () => {
  it('returns protected_customer_data with docs link when message matches PCD patterns', () => {
    const payload: ShopifyGraphQLResponseErrors = {
      graphQLErrors: [
        { message: 'This app is not approved to access the Order object.' },
      ],
    }
    const classified = classifyGraphQLError(payload)
    expect(classified.kind).toBe('protected_customer_data')
    expect(classified.docsUrl).toBe(
      'https://shopify.dev/docs/apps/launch/protected-customer-data'
    )
  })

  it('returns missing_scope when message indicates missing access scope', () => {
    const payload: ShopifyGraphQLResponseErrors = {
      graphQLErrors: [
        { message: 'You are missing access scope read_customers.' },
      ],
    }
    const classified = classifyGraphQLError(payload)
    expect(classified.kind).toBe('missing_scope')
  })

  it('returns throttled when extensions.code includes THROTTLED', () => {
    const payload: ShopifyGraphQLResponseErrors = {
      graphQLErrors: [
        { message: 'throttled', extensions: { code: 'THROTTLED' } },
      ],
    }
    const classified = classifyGraphQLError(payload)
    expect(classified.kind).toBe('throttled')
  })

  it('falls back to unknown when no patterns match', () => {
    const payload: ShopifyGraphQLResponseErrors = {
      graphQLErrors: [{ message: 'Some other error' }],
    }
    const classified = classifyGraphQLError(payload)
    expect(classified.kind).toBe('unknown')
  })
})

describe('ShopifyGraphQLRequestError helpers', () => {
  it('creates and detects typed errors', () => {
    const error = createShopifyGraphQLRequestError({
      kind: 'missing_scope',
      message: 'missing scope',
    })
    expect(error).toBeInstanceOf(Error)
    expect(error.kind).toBe('missing_scope')
    expect(isShopifyGraphQLRequestError(error)).toBe(true)
  })

  it('guards against generic errors', () => {
    const error = new Error('boom')
    expect(isShopifyGraphQLRequestError(error)).toBe(false)
  })
})
