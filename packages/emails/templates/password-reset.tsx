import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface PasswordResetProps {
  appName: string
  email: string
  resetCode: string
}

export const templateName = 'password-reset'

export const previewProps = {
  ...sharedPreviewProps,
  email: 'user@example.com',
  resetCode: 'EXPECTO-PATRONUM'
} satisfies PasswordResetProps

export const templateProps = {
  ...sharedTemplateProps,
  email: '{{email}}',
  resetCode: '{{reset_code}}'
} satisfies PasswordResetProps

export const Template = ({ appName, email, resetCode }: PasswordResetProps) => (
  <Layout appName={appName} preview='Your password reset code'>
    <CardHeader title='Reset your password' />
    <Text>Hello,</Text>
    <Text>
      You requested to reset your password for <strong>{email}</strong>.
    </Text>
    <Text>
      Use the code below to reset your password. Type it on the reset screen; the code works once.
    </Text>
    <OneTimeCode>{resetCode}</OneTimeCode>
    <Alert variant='warning'>
      <strong>Important:</strong> this code expires in 1 hour. If you did not request this change,
      please ignore this email.
    </Alert>
    <AccountNotice appName={appName} />
  </Layout>
)
