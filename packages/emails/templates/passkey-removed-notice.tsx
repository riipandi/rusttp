import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `credential_name` is empty when the passkey has no name.

interface PasskeyRemovedNoticeProps {
  appName: string
  name: string
  email: string
  credentialName: string
}

export const templateName = 'passkey-removed-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Robert Langdon',
  email: 'langdon@example.com',
  credentialName: "Sophie's Laptop"
} satisfies PasskeyRemovedNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}',
  credentialName: '{{credential_name}}'
} satisfies PasskeyRemovedNoticeProps

export const Template = ({ appName, name, email, credentialName }: PasskeyRemovedNoticeProps) => (
  <Layout appName={appName} preview='A passkey was removed from your account'>
    <CardHeader title='A passkey was removed from your account' />
    <Text>Hi {name},</Text>
    <Text>
      The passkey
      <When value={credentialName}> named &ldquo;{credentialName}&rdquo;</When> was removed from{' '}
      <strong>{email}</strong> and can no longer be used to sign in.
    </Text>
    <Alert variant='warning'>
      Didn&apos;t remove this passkey? Someone else may have access to your account. Change your
      password and contact support right away.
    </Alert>
  </Layout>
)
