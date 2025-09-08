'use client'
import { Button } from '@shopify/polaris'
import { useAB } from '@/lib/useAB'

type Props = {
  label: string
  run: () => Promise<void>
  success: string
  error?: string
}

export default function RunTaskButton({
  label,
  run,
  success,
  error = 'Something went wrong',
}: Props) {
  const { loading, toastSuccess, toastError } = useAB()

  async function onClick() {
    try {
      loading(true)
      await run()
      toastSuccess(success)
    } catch {
      toastError(error)
    } finally {
      loading(false)
    }
  }
  return <Button onClick={onClick}>{label}</Button>
}
