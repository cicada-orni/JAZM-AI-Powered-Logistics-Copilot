// apps/web/src/app/notifications/page.tsx
'use client'

import PageTitleBar from '@/components/app/PageTitleBar'
import { Page, Card, BlockStack, Text } from '@shopify/polaris'
import { useAB } from '@/lib/useAB'
import { BULK_SYNC_MODAL_ID } from '@/components/app/BulkSyncModal'

export default function NotificationsPage() {
  const { showModal, toastSuccess } = useAB()

  return (
    <>
      <PageTitleBar
        title="Notifications"
        primaryAction={{
          label: 'Bulk sync',
          onClick: () => showModal(BULK_SYNC_MODAL_ID),
        }}
        secondaryActions={[
          {
            label: 'Mark all read',
            onClick: () => toastSuccess('All caught up'),
          },
        ]}
      />

      <Page>
        <BlockStack gap="400">
          <Card>
            <Text as="p" tone="subdued">
              Placeholder — your webhook notices and operational alerts will
              appear here.
            </Text>
          </Card>
        </BlockStack>
      </Page>
    </>
  )
}
