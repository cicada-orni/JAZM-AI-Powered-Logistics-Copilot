'use client'
import { Page, Layout, Card, Text } from '@shopify/polaris'

export default function Notifications() {
  return (
    <Page
      title="Notifications"
      primaryAction={{ content: 'Notifications', onAction: () => {} }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Notifications"
          description="View RTO risks and logistics data per notification."
        >
          <Card>
            <Text as="p">Placeholder</Text>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  )
}
