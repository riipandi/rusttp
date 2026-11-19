import { CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview={`Your ${appName} verification code`}>
    <CardHeader title='Verify your email address' />
    <Text>Hi {name},</Text>
    <Text>
      Enter this code on the verification screen to confirm your email address and finish setting up
      your {appName} account:
    </Text>
    <OneTimeCode>{verificationCode}</OneTimeCode>
    <Text>
      The code expires in 1 hour and works once. If you didn&apos;t create an account, you can
      safely ignore this email.
    </Text>
  </Layout>
)
