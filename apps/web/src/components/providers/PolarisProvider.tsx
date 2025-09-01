'use client'

import { AppProvider } from '@shopify/polaris'
import en from '@shopify/polaris/locales/en.json'
import Link from 'next/link'
import type { LinkLikeComponentProps } from '@shopify/polaris/build/ts/src/utilities/link'

// Let Polaris use Next.js client-side routing.
// Docs: AppProvider linkComponent. :contentReference[oaicite:6]{index=6}
function NextLinkAdapter({
  children,
  url = '',
  external,
  ...rest
}: LinkLikeComponentProps) {
  if (external) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link href={url} {...rest}>
      {children}
    </Link>
  )
}

export function PolarisProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={en} linkComponent={NextLinkAdapter}>
      {children}
    </AppProvider>
  )
}
