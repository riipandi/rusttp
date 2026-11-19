import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// The server pre-formats `expires_at` for the reader.

interface ApiKeyExpiringSoonProps {
  appName: string
  supportUrl: string
  name: string
  apiKeyName: string
  expiresAt: string
}

export const templateName = 'api-key-expiring-soon'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Katherine Solomon',
  apiKeyName: 'Noetic lab',
  expiresAt: 'October 7, 2026'
} satisfies ApiKeyExpiringSoonProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  apiKeyName: '{{api_key_name}}',
  expiresAt: '{{expires_at}}'
} satisfies ApiKeyExpiringSoonProps

export const Template = ({
  appName,
  supportUrl,
  name,
  apiKeyName,
  expiresAt
}: ApiKeyExpiringSoonProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview={`${apiKeyName} expires on ${expiresAt}`}
  >
    <CardHeader title='Your API key expires soon' warning />
    <Text>Hi {name},</Text>
    <Text>
      Your API key <strong>{apiKeyName}</strong> expires on <strong>{expiresAt}</strong>. After
      that, requests that use it will be rejected.
    </Text>
    <Text>
      To avoid interruptions, create a new key and update your integrations before then. If you no
      longer use this key, you can ignore this email.
    </Text>
  </Layout>
)
