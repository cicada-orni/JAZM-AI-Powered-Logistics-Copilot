'use client'

//  --- OFFLINE TOKEN EXCHANGE ---
import { AuthInit } from '@/components/auth/AuthInit.client'
//  --- OFFLINE TOKEN EXCHANGE ---

import PageTitleBar from '@/components/app/PageTitleBar'
import RunTaskButton from '@/components/app/RunTaskButton'
import BulkSyncModal from '@/components/app/BulkSyncModal'
import { Card, Page, Text, BlockStack } from '@shopify/polaris'

export default function Dashboard() {
  return (
    <>
      {/* --- OFFLINE TOKEN EXCHANGE --- */}
      <AuthInit />
      {/* --- OFFLINE TOKEN EXCHANGE --- */}

      {/* --------------------- PAGE CONTENT --------------------- */}

      <PageTitleBar title="Dashboard" />

      {/* 2. We render the page's body content using Polaris. */}
      <Page>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                Product Insights
              </Text>
              <Text as="p" tone="subdued">
                View RTO risks and logistics data per product.
              </Text>

              {/* 3. We use our reusable SOP button for an async action. */}
              <RunTaskButton
                label="Recompute insights"
                success="Insights recompute queued"
                runAction={async () => {
                  // Placeholder for a real API call
                  await new Promise((r) => setTimeout(r, 600))
                }}
              />
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>

      {/* 4. We DECLARE our modal. It is now in the React tree but invisible. */}
      <BulkSyncModal />
    </>
  )
}
