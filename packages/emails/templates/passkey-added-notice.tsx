import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `credential_name` is empty when the passkey has no name.

interface PasskeyAddedNoticeProps {
  appName: string
  supportUrl: string
  name: string
  email: string
  credentialName: string
}

export const templateName = 'passkey-added-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Robert Langdon',
  email: 'robert.langdon@example.com',
  credentialName: 'Mickey Mouse watch'
} satisfies PasskeyAddedNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}',
  credentialName: '{{credential_name}}'
} satisfies PasskeyAddedNoticeProps

export const Template = ({
  appName,
  supportUrl,
  name,
  email,
  credentialName
}: PasskeyAddedNoticeProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview='A new passkey was added to your account'
  >
    <CardHeader title='A passkey was added to your account' />
    <Text>Hi {name},</Text>
    <Text>
      A new passkey
      <When value={credentialName}> named &ldquo;{credentialName}&rdquo;</When> was added to{' '}
      <strong>{email}</strong>. You can now use it to sign in.
    </Text>
    <Alert variant='warning'>
      Didn&apos;t add this passkey? Someone else may have access to your account. Remove it in your
      security settings and contact support right away.
    </Alert>
  </Layout>
)
