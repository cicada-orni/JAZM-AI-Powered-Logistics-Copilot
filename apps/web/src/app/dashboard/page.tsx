'use client'
import { Page, Card, Text } from '@shopify/polaris'

export default function DashboardPage() {
  return (
    <Page
      title="Dashboard"
      primaryAction={{ content: 'Add Insight', onAction: () => {} }}
    >
      <Card>
        <Text as="p" variant="bodyMd">
          Analytics placeholder.
        </Text>
      </Card>
    </Page>
  )
}
