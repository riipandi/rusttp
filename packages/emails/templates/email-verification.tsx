import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface EmailVerificationProps {
  appName: string
  name: string
  verificationCode: string
}

export const templateName = 'email-verification'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'John Doe',
  verificationCode: 'GRYFFINDOR-EXPECTO'
} satisfies EmailVerificationProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  verificationCode: '{{verification_code}}'
} satisfies EmailVerificationProps

export const Template = ({ appName, name, verificationCode }: EmailVerificationProps) => (
  <Layout appName={appName} preview='Your email verification code'>
    <CardHeader title='Email verification' />
    <Text>Hello {name},</Text>
    <Text>
      Use the code below to verify your email address for {appName}. Type it on the verification
      screen; the code works once.
    </Text>
    <OneTimeCode>{verificationCode}</OneTimeCode>
    <Text>
      <strong>Important:</strong> this code expires in 1 hour.
    </Text>
    <Text>If you did not create an account, please ignore this email.</Text>
    <AccountNotice appName={appName} />
  </Layout>
)
