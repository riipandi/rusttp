import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview='Someone tried to sign up with your email address'>
    <CardHeader title='Someone tried to sign up with your email' />
    <Text>Hi {name},</Text>
    <Text>
      Someone tried to create a new {appName} account with <strong>{email}</strong>, but that
      address already belongs to your account.
    </Text>
    <Alert variant='info'>
      Nothing has changed: no new account was created and your account is untouched.
    </Alert>
    <Text>
      If it was you, sign in instead, or reset your password if you&apos;ve forgotten it. If it
      wasn&apos;t, there&apos;s nothing you need to do.
    </Text>
  </Layout>
)
