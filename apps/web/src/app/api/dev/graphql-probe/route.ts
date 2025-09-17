import { NextResponse } from 'next/server'
import { getGrantedAccessScopes } from '@/lib/shopify-graphql/health'
import { listRecentPaidOrders } from '@/lib/shopify-graphql/orders'
import { listRecentCustomers } from '@/lib/shopify-graphql/customers'
import { listRecentProducts } from '@/lib/shopify-graphql/products'

export const runtime = 'nodejs'

function isEnabled() {
  if (process.env.NODE_ENV === 'production') return false
  return process.env.DEV_GRAPHQL_PROBE_ENABLED === 'true'
}

type SampleLabel = 'orders' | 'customers' | 'products'

type SampleSuccess = {
  label: SampleLabel
  status: 'ok'
  count: number
}

type SampleFailure = {
  label: SampleLabel
  status: 'error'
  message: string
  docsUrl?: string
}

type SampleResult = SampleSuccess | SampleFailure

async function takeFirst<T>(
  factory: () => AsyncGenerator<T[], void, unknown>
): Promise<number> {
  const gen = factory()
  try {
    const { value } = await gen.next()
    return Array.isArray(value) ? value.length : 0
  } finally {
    if (typeof gen.return === 'function') {
      try {
        await gen.return(undefined)
      } catch (err) {
        // Swallow generator cleanup errors to avoid masking the original issue.
        console.debug('GraphQL probe generator cleanup error', err)
      }
    }
  }
}

function formatSampleError(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Unknown error'
}

async function collectSample(
  label: SampleLabel,
  factory: () => AsyncGenerator<unknown[], void, unknown>
): Promise<SampleResult> {
  try {
    const count = await takeFirst(factory)
    return { label, status: 'ok', count }
  } catch (err) {
    const message = formatSampleError(err)
    const docsUrl = message.includes('protected-customer-data')
      ? 'https://shopify.dev/docs/apps/launch/protected-customer-data'
      : undefined
    return { label, status: 'error', message, docsUrl }
  }
}

export async function GET(req: Request) {
  try {
    if (!isEnabled()) {
      return NextResponse.json({ error: 'Disabled' }, { status: 404 })
    }
    const url = new URL(req.url)
    const shop = url.searchParams.get('shop')
    if (!shop) {
      return NextResponse.json({ error: 'Missing shop param' }, { status: 400 })
    }

    const scopes = await getGrantedAccessScopes(shop)

    const sampleResults = await Promise.all([
      collectSample('orders', () =>
        listRecentPaidOrders(shop, { pageSize: 25, maxPages: 1 })
      ),
      collectSample('customers', () =>
        listRecentCustomers(shop, { pageSize: 25, maxPages: 1 })
      ),
      collectSample('products', () =>
        listRecentProducts(shop, { pageSize: 25, maxPages: 1 })
      ),
    ])

    const issues = sampleResults.filter(
      (result): result is SampleFailure => result.status === 'error'
    )

    const samples = sampleResults.reduce(
      (acc, result) => {
        switch (result.label) {
          case 'orders':
            acc.paidOrdersFirstPageCount =
              result.status === 'ok' ? result.count : null
            break
          case 'customers':
            acc.customersFirstPageCount =
              result.status === 'ok' ? result.count : null
            break
          case 'products':
            acc.productsFirstPageCount =
              result.status === 'ok' ? result.count : null
            break
        }
        return acc
      },
      {
        paidOrdersFirstPageCount: null as number | null,
        customersFirstPageCount: null as number | null,
        productsFirstPageCount: null as number | null,
      }
    )

    return NextResponse.json({
      ok: issues.length === 0,
      scopes,
      samples,
      issues: issues.length
        ? issues.map(({ label, message, docsUrl }) => ({
            label,
            message,
            docsUrl,
          }))
        : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Probe failed', message },
      { status: 500 }
    )
  }
}
