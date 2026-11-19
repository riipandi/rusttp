import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface SignupAttemptExistingEmailProps {
  appName: string
  name: string
  email: string
}

export const templateName = 'signup-attempt-existing-email'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Sophie Neveu',
  email: 'user@example.com'
} satisfies SignupAttemptExistingEmailProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}'
} satisfies SignupAttemptExistingEmailProps

export const Template = ({ appName, name, email }: SignupAttemptExistingEmailProps) => (
  <Layout appName={appName} preview='Someone tried to sign up with your email'>
    <CardHeader title='Sign-up attempt for your email' />
    <Text>Hello {name},</Text>
    <Text>
      Someone just tried to create an account using <strong>{email}</strong>, the address already on
      an account in {appName}.
    </Text>
    <Alert variant='info'>
      <strong>No action is needed.</strong> Nothing was created, nothing was changed, and this
      message grants nothing.
    </Alert>
    <Text>
      If you tried to sign up just now: you already have an account here. Sign in instead, or reset
      your password if you have lost it.
    </Text>
    <Text>
      If this wasn&apos;t you, no response is required. We&apos;ll keep notifying you of attempts on
      your address.
    </Text>
    <AccountNotice appName={appName} />
  </Layout>
)
