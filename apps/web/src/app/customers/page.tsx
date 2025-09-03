'use client'
import { Page, Layout, Card, Text } from '@shopify/polaris'

export default function Customers() {
  return (
    <Page
      title="Customers"
      primaryAction={{ content: 'Manage Products', onAction: () => {} }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Customers Insights"
          description="View RTO risks and logistics data per product."
        >
          <Card>
            <Text as="p">Placeholder for customers data and analytics.</Text>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  )
}
