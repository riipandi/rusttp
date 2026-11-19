import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface PasswordRemovedNoticeProps {
  appName: string
  name: string
  email: string
}

export const templateName = 'password-removed-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Robert Langdon',
  email: 'langdon@example.com'
} satisfies PasswordRemovedNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}'
} satisfies PasswordRemovedNoticeProps

export const Template = ({ appName, name, email }: PasswordRemovedNoticeProps) => (
  <Layout appName={appName} preview='Your password was removed'>
    <CardHeader title='Your password was removed' />
    <Text>Hello {name},</Text>
    <Text>
      The password for the account <strong>{email}</strong> was removed. You can still sign in with
      the other methods the account keeps, such as a passkey or a linked sign-in provider.
    </Text>
    <Alert variant='warning'>
      <strong>Security notice:</strong> if you did <strong>not</strong> remove the password, someone
      may have access to the account. Please contact support immediately.
    </Alert>
    <AccountNotice appName={appName} />
  </Layout>
)
