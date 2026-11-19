import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview={`Your ${appName} password reset code`}>
    <CardHeader title='Reset your password' />
    <Text>Hi,</Text>
    <Text>
      We received a request to reset the password for <strong>{email}</strong>. Enter this code on
      the reset screen to choose a new password:
    </Text>
    <OneTimeCode>{resetCode}</OneTimeCode>
    <Alert variant='warning'>
      The code expires in 1 hour and works once. If you didn&apos;t ask for a reset, ignore this
      email and your password stays the same.
    </Alert>
  </Layout>
)
