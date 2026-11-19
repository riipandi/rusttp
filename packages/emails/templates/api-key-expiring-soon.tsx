import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// The server pre-formats `expires_at` for the reader.

interface ApiKeyExpiringSoonProps {
  appName: string
  name: string
  apiKeyName: string
  expiresAt: string
}

export const templateName = 'api-key-expiring-soon'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Elias Schneider',
  apiKeyName: 'My API Key',
  expiresAt: 'September 30, 2024'
} satisfies ApiKeyExpiringSoonProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  apiKeyName: '{{api_key_name}}',
  expiresAt: '{{expires_at}}'
} satisfies ApiKeyExpiringSoonProps

export const Template = ({ appName, name, apiKeyName, expiresAt }: ApiKeyExpiringSoonProps) => (
  <Layout appName={appName} preview={`${apiKeyName} expires on ${expiresAt}`}>
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
