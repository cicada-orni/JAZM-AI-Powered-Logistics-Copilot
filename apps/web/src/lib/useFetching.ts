'use client'
import { useAB } from './useAB'

export function useFetching() {
  const { loading } = useAB()
  return async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    try {
      loading(true)
      return await fn()
    } finally {
      loading(false)
    }
  }
}
