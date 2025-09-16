import type { IterateOptions } from './pagination'

export type PageLogInfo = Parameters<NonNullable<IterateOptions['onPage']>>[0]

export function createOnPageLogger(resource: string) {
  return (info: PageLogInfo) => {
    const cost = info.cost
    const requested = cost?.requestedQueryCost
    const actual = cost?.actualQueryCost
    const avail = cost?.throttleStatus?.currentlyAvailable
    const restore = cost?.throttleStatus?.restoreRate
    console.log(
      JSON.stringify({
        scope: 'shopify-graphql',
        resource,
        page: info.page,
        items: info.items,
        elapsedMs: info.elapsedMs,
        endCursor: info.endCursor ?? null,
        requestedQueryCost: requested,
        actualQueryCost: actual,
        currentlyAvailable: avail,
        restoreRate: restore,
      })
    )
  }
}
