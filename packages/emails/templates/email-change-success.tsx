import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface EmailChangeSuccessProps {
  appName: string
  name: string
  newEmail: string
}

export const templateName = 'email-change-success'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'John Doe',
  newEmail: 'new@example.com'
} satisfies EmailChangeSuccessProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  newEmail: '{{new_email}}'
} satisfies EmailChangeSuccessProps

export const Template = ({ appName, name, newEmail }: EmailChangeSuccessProps) => (
  <Layout appName={appName} preview='Your email address change is complete'>
    <CardHeader title='Email change successful' />
    <Text>Hello {name},</Text>
    <Text>
      Your email address has been changed to <strong>{newEmail}</strong>.
    </Text>
    <Alert variant='success'>
      <strong>Security notice:</strong> all your sessions have been signed out.
      <br />
      Please sign in again with your new email address.
    </Alert>
    <Text>If you did not make this change, please contact support immediately.</Text>
    <AccountNotice appName={appName} />
  </Layout>
)
