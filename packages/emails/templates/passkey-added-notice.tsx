import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `credential_name` is empty when the passkey has no name.

interface PasskeyAddedNoticeProps {
  appName: string
  name: string
  email: string
  credentialName: string
}

export const templateName = 'passkey-added-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Robert Langdon',
  email: 'langdon@example.com',
  credentialName: "Sophie's Laptop"
} satisfies PasskeyAddedNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}',
  credentialName: '{{credential_name}}'
} satisfies PasskeyAddedNoticeProps

export const Template = ({ appName, name, email, credentialName }: PasskeyAddedNoticeProps) => (
  <Layout appName={appName} preview='A passkey was added'>
    <CardHeader title='A passkey was added' />
    <Text>Hello {name},</Text>
    <Text>
      A new passkey
      <When value={credentialName}> named &ldquo;{credentialName}&rdquo;</When> was added to the
      account <strong>{email}</strong>. You can now sign in with it.
    </Text>
    <Alert variant='warning'>
      <strong>Security notice:</strong> If you did <strong>not</strong> add this passkey, someone
      may have access to the account. Please remove the passkey and contact support immediately.
    </Alert>
    <AccountNotice appName={appName} />
  </Layout>
)
