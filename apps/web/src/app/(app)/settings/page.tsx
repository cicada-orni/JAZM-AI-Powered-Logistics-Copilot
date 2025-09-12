'use client'
import { Page, Layout, Card, Text } from '@shopify/polaris'
import PageTitleBar from '@/components/app/PageTitleBar'

export default function Settings() {
  return (
    <>
      <PageTitleBar title="Settings" />
      <Page
        title="Settings"
        primaryAction={{ content: 'Manage Settings', onAction: () => {} }}
      >
        <Layout>
          <Layout.AnnotatedSection
            title="Product Insights"
            description="View RTO risks and logistics data per setting."
          >
            <Card>
              <Text as="p">
                Placeholder for setting and analytics. Coming soon!
              </Text>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </>
  )
}
