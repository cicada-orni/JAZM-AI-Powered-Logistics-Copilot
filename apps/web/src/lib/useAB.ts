'use client'
import { useAppBridge } from '@shopify/app-bridge-react'

export function useAB() {
  const shopify = useAppBridge()

  // --- TOAST ---
  function toastSuccess(message: string, ms = 5000) {
    return shopify.toast.show(message, { duration: ms })
  }

  function toastError(message: string, ms = 5000) {
    return shopify.toast.show(message, { duration: ms, isError: true })
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

  // Open a URL at the top-level (outside the iframe)
  function navigateTo(url: string) {
    window.open(url, '_top')
  }

  // Open a Shopify Admin path via the shopify://admin scheme
  function openAdmin(path: string) {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return navigateTo(`shopify://admin${normalized}`)
  }

  return {
    shopify,
    toastSuccess,
    toastError,
    loading,
    showModal,
    hideModal,
    navigateTo,
    openAdmin,
  }
}
