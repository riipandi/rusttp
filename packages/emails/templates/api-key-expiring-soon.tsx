import { AccountNotice, CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview={`Your API key ${apiKeyName} expires soon`}>
    <CardHeader title='API key expiring soon' warning />
    <Text>Hello {name},</Text>
    <Text>
      This is a reminder that your API key <strong>{apiKeyName}</strong> will expire soon.
    </Text>
    <Text>
      Expiration date: <strong>{expiresAt}</strong>
    </Text>
    <Text>Please generate a new API key if you need continued access.</Text>
    <AccountNotice appName={appName} />
  </Layout>
)
