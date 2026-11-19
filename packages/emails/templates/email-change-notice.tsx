import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Details } from '../components/details.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface EmailChangeNoticeProps {
  appName: string
  name: string
  oldEmail: string
  newEmail: string
}

export const templateName = 'email-change-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'John Doe',
  oldEmail: 'old@example.com',
  newEmail: 'new@example.com'
} satisfies EmailChangeNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  oldEmail: '{{old_email}}',
  newEmail: '{{new_email}}'
} satisfies EmailChangeNoticeProps

export const Template = ({ appName, name, oldEmail, newEmail }: EmailChangeNoticeProps) => (
  <Layout appName={appName} preview='Your email address was changed'>
    <CardHeader title='Email change confirmation' />
    <Text>Hello {name},</Text>
    <Text>This is to confirm that your email address has been changed:</Text>
    <Details
      items={[
        { label: 'Old email', value: oldEmail },
        { label: 'New email', value: newEmail }
      ]}
    />
    <Alert variant='info'>
      <strong>Security notice:</strong> all your sessions have been signed out. Please sign in again
      with your new email address.
    </Alert>
    <Text>If you did not make this change, please contact support immediately.</Text>
    <AccountNotice appName={appName} />
  </Layout>
)
