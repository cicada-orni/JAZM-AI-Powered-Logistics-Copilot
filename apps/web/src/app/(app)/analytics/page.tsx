'use client'
import { Page, Layout, Card, Text } from '@shopify/polaris'

export default function Analytics() {
  return (
    <Page
      title="Analytics"
      primaryAction={{ content: 'Configure Analytics', onAction: () => {} }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Performance Analytics"
          description="Track RTO trends and delivery metrics."
        >
          <Card>
            <Text as="p">
              Placeholder for analytics charts and insights. Coming soon!
            </Text>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  )
}
