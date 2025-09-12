'use client'
import { Button } from '@shopify/polaris'
import { useAB } from '@/lib/useAB'

type Props = {
  label: string
  // Next.js client components prefer function props named `action` or ending with `Action`.
  runAction: () => Promise<void>
  success: string
  error?: string
}

export default function RunTaskButton({
  label,
  runAction,
  success,
  error = 'Something went wrong',
}: Props) {
  const { loading, toastSuccess, toastError } = useAB()

  async function onClick() {
    try {
      loading(true)
      await runAction()
      toastSuccess(success)
    } catch {
      toastError(error)
    } finally {
      loading(false)
    }
  }
  return <Button onClick={onClick}>{label}</Button>
}
