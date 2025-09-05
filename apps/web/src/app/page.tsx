'use client'
import { Page, Layout, Card, Text } from '@shopify/polaris'
import { AuthInit } from '@/components/providers/AuthInit.client'

export default function Dashboard() {
  return (
    <>
      <AuthInit />
      <Page
        title="Dashboard"
        primaryAction={{ content: 'View Analytics', onAction: () => {} }}
      >
        <Layout>
          <Layout.AnnotatedSection
            title="Product Insights"
            description="View RTO risks and logistics data per product."
          >
            <Card>
              <Text as="p">
                Placeholder for dashboard and analytics. Coming soon!
              </Text>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </>
  )
}
