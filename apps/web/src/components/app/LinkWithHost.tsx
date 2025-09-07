'use client'
import Link, { LinkProps } from 'next/link'
import { PropsWithChildren, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { getStoredHost, getStoredShop, withHostParams } from '@/lib/host'

type Props = PropsWithChildren<LinkProps & { className?: string }>

export default function LinkWithHost({
  href,
  children,
  className,
  ...rest
}: Props) {
  const params = useSearchParams()
  const host = params.get('host') ?? getStoredHost()
  const shop = params.get('shop') ?? getStoredShop()

  const normalizedHref = useMemo(() => {
    const hrefStr = typeof href === 'string' ? href : href.toString()
    return withHostParams(hrefStr, host, shop)
  }, [href, host, shop])

  return (
    <Link href={normalizedHref} className={className} {...rest}>
      {children}
    </Link>
  )
}
