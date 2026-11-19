import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview='Your account is temporarily locked'>
    <CardHeader title='Your account is locked' />
    <Text>Hi {name},</Text>
    <Text>
      We locked <strong>{email}</strong> after too many failed sign-in attempts. It stays locked{' '}
      <When value={expiresAt} otherwise='until an administrator unlocks it'>
        until {expiresAt}
      </When>
      .
    </Text>
    <Alert variant='warning'>
      If this was you, wait until the lock ends, or reset your password to get back in sooner.
    </Alert>
    <Text>If it wasn&apos;t you, someone may know your password. Reset it as soon as you can.</Text>
  </Layout>
)
