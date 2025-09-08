'use client'
import { Button } from '@shopify/polaris'
import { useFetching } from '@/lib/useFetching'
import { useAB } from '@/lib/useAB'

export default function RequeryButton() {
  const withLoading = useFetching()
  const { toastSuccess } = useAB()

  return (
    <Button
      onClick={withLoading(async () => {
        await new Promise((r) => setTimeout(r, 700))
        toastSuccess('Products refreshed')
      })}
    >
      Refresh products
    </Button>
  )
}
