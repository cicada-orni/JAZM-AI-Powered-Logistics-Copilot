'use client'
import { useAppBridge } from '@shopify/app-bridge-react'

export function useAB() {
  const shopify = useAppBridge()

  // --- TOAST ---
  function toastSuccess(message: string, ms = 5000) {
    return shopify.toast.show(message, { duration: ms })
  }

  function toastError(message: string, ms = 5000) {
    return shopify.toast.error(message, { duration: ms, isError: true })
  }

  //   --- LOADING ---
  function loading(on: boolean) {
    return shopify.loading(on)
  }

  //   --- MODAL ---
  function showModal(id: string) {
    shopify.modal.show(id)
  }

  function hideModal(id: string) {
    shopify.modal.hide(id)
  }

  return {
    shopify,
    toastSuccess,
    toastError,
    loading,
    showModal,
    showModal,
    hideModal,
  }
}
