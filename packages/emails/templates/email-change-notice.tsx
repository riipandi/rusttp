import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
import { Details } from '../components/details.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface EmailChangeNoticeProps {
  appName: string
  supportUrl: string
  name: string
  oldEmail: string
  newEmail: string
}

export const templateName = 'email-change-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Sophie Neveu',
  oldEmail: 'sophie.neveu@example.com',
  newEmail: 'sophie.sauniere@example.com'
} satisfies EmailChangeNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  oldEmail: '{{old_email}}',
  newEmail: '{{new_email}}'
} satisfies EmailChangeNoticeProps

export const Template = ({
  appName,
  supportUrl,
  name,
  oldEmail,
  newEmail
}: EmailChangeNoticeProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview='The email address on your account was changed'
  >
    <CardHeader title='Your email address was changed' />
    <Text>Hi {name},</Text>
    <Text>
      The email address on your account was changed. Use the new address the next time you sign in.
    </Text>
    <Details
      items={[
        { label: 'Previous email', value: oldEmail },
        { label: 'New email', value: newEmail }
      ]}
    />
    <Alert variant='info'>
      For your security, we signed you out on every device. Sign in again with your new email
      address.
    </Alert>
    <Text>
      Didn&apos;t make this change? Contact support right away so we can secure your account.
    </Text>
  </Layout>
)
