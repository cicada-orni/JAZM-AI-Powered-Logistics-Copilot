// apps/web/src/components/app/BulkSyncModal.tsx
'use client'

import { Modal, TitleBar } from '@shopify/app-bridge-react'
import { useAB } from '@/lib/useAB'
import { Text, BlockStack, Card } from '@shopify/polaris'

export const BULK_SYNC_MODAL_ID = 'bulk-sync-modal'

/**
 * Admin-native modal for long-running operations.
 * Uses App Bridge Modal + TitleBar (not Polaris Modal).
 */
export default function BulkSyncModal() {
  const { hideModal, toastSuccess, loading } = useAB()

  async function handleStart() {
    try {
      loading(true)
      // … call your API here …
      await new Promise((r) => setTimeout(r, 800)) // placeholder
      toastSuccess('Bulk sync started')
      hideModal(BULK_SYNC_MODAL_ID)
    } finally {
      loading(false)
    }
  }

  return (
    <Modal id={BULK_SYNC_MODAL_ID} variant="max">
      {/* Modal body is rendered inside your iframe; keep it Polaris-native. */}
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="200">
            <Text as="h3" variant="headingLg">
              Start product bulk sync
            </Text>
            <Text as="p" tone="subdued">
              We’ll fetch products and compute logistics insights. You can close
              this modal — we’ll toast you when the job starts.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>

      {/* Modal TitleBar is App Bridge native (admin chrome), not in-iframe. */}
      <TitleBar title="Bulk sync">
        <button onClick={() => hideModal(BULK_SYNC_MODAL_ID)}>Cancel</button>
        <button variant="primary" onClick={handleStart}>
          Start sync
        </button>
      </TitleBar>
    </Modal>
  )
}
