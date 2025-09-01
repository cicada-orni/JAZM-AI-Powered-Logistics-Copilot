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
            <Text as="p">
              Placeholder for product list and analytics. Coming soon!
            </Text>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  )
}
