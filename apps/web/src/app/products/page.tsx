'use client'
import { Page, Layout, Card, Text } from '@shopify/polaris'

export default function Products() {
  return (
    <Page
      title="Products"
      primaryAction={{ content: 'Manage Products', onAction: () => {} }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Product Insights"
          description="View RTO risks and logistics data per product."
        >
          <Card>
            <Text as="p">Placeholder</Text>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  )
}
