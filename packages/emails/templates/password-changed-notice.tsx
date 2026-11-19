import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface PasswordChangedNoticeProps {
  appName: string
  name: string
  email: string
}

export const templateName = 'password-changed-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Robert Langdon',
  email: 'user@example.com'
} satisfies PasswordChangedNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}'
} satisfies PasswordChangedNoticeProps

export const Template = ({ appName, name, email }: PasswordChangedNoticeProps) => (
  <Layout appName={appName} preview='Your password was changed'>
    <CardHeader title='Your password was changed' />
    <Text>Hello {name},</Text>
    <Text>
      The password for <strong>{email}</strong> was just changed through a password reset.
    </Text>
    <Alert variant='info'>
      <strong>Security notice:</strong> all active sessions have been signed out. If this was you,
      you can sign in with your new password.
    </Alert>
    <Text>
      If you did <strong>not</strong> make this change, please contact support immediately; your
      account may be at risk.
    </Text>
    <AccountNotice appName={appName} />
  </Layout>
)
