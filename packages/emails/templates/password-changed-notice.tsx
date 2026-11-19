import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface PasswordChangedNoticeProps {
  appName: string
  supportUrl: string
  name: string
  email: string
}

export const templateName = 'password-changed-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Robert Langdon',
  email: 'robert.langdon@example.com'
} satisfies PasswordChangedNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}'
} satisfies PasswordChangedNoticeProps

export const Template = ({ appName, supportUrl, name, email }: PasswordChangedNoticeProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview='The password for your account was changed'
  >
    <CardHeader title='Your password was changed' />
    <Text>Hi {name},</Text>
    <Text>
      The password for <strong>{email}</strong> was just changed with a password reset.
    </Text>
    <Alert variant='info'>
      For your security, we signed you out on every device. Sign in again with your new password.
    </Alert>
    <Text>
      Didn&apos;t make this change? Reset your password and contact support right away; your account
      may be at risk.
    </Text>
  </Layout>
)
