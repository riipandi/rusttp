import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `expires_at` is empty when only an administrator can unlock the account.

interface UserLockedProps {
  appName: string
  name: string
  email: string
  expiresAt: string
}

export const templateName = 'user-locked'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Robert Langdon',
  email: 'langdon@example.com',
  expiresAt: ''
} satisfies UserLockedProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}',
  expiresAt: '{{expires_at}}'
} satisfies UserLockedProps

export const Template = ({ appName, name, email, expiresAt }: UserLockedProps) => (
  <Layout appName={appName} preview='Your account was locked'>
    <CardHeader title='Your account was locked' />
    <Text>Hello {name},</Text>
    <Text>
      The account <strong>{email}</strong> was locked{' '}
      <When value={expiresAt} otherwise='until an administrator unlocks it'>
        until {expiresAt}
      </When>{' '}
      after too many failed sign-in attempts with the password.
    </Text>
    <Alert variant='warning'>
      <strong>Security notice:</strong> if you tried to sign in just now, wait for the lock to pass
      and try again, or reset your password to regain access sooner.
    </Alert>
    <Text>
      If you did <strong>not</strong> try to sign in, someone may have your password. Please reset
      it now.
    </Text>
    <AccountNotice appName={appName} />
  </Layout>
)
