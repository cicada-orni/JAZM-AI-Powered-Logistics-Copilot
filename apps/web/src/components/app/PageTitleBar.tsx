'use client'

import { TitleBar } from '@shopify/app-bridge-react'

type Props = {
  title: string
  primaryAction?: { label: string; onClick?: () => void }
  secondaryActions?: Array<{ label: string; onClick?: () => void }>
  breadcrumbLabel?: string
}

export default function PageTitleBar({
  title,
  primaryAction,
  secondaryActions = [],
  breadcrumbLabel,
}: Props) {
  return (
    <TitleBar title={title}>
      {breadcrumbLabel ? (
        <button variant="breadcrumb">{breadcrumbLabel}</button>
      ) : null}

      {secondaryActions.length > 0 ? (
        <section aria-label="More actions">
          {secondaryActions.map((a, i) => (
            <button key={i} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </section>
      ) : null}

      {primaryAction ? (
        <button variant="primary" onClick={primaryAction.onClick}>
          {primaryAction.label}
        </button>
      ) : null}
    </TitleBar>
  )
}
