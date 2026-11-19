import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface EmailChangeSuccessProps {
  appName: string
  supportUrl: string
  name: string
  newEmail: string
}

export const templateName = 'email-change-success'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Vittoria Vetra',
  newEmail: 'vittoria.vetra@example.com'
} satisfies EmailChangeSuccessProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  newEmail: '{{new_email}}'
} satisfies EmailChangeSuccessProps

export const Template = ({ appName, supportUrl, name, newEmail }: EmailChangeSuccessProps) => (
  <Layout appName={appName} supportUrl={supportUrl} preview='Your new email address is now active'>
    <CardHeader title='Your email address was updated' />
    <Text>Hi {name},</Text>
    <Text>
      Your account now uses <strong>{newEmail}</strong>. Use this address the next time you sign in.
    </Text>
    <Alert variant='success'>
      For your security, we signed you out on every device. Sign in again with your new email
      address.
    </Alert>
    <Text>
      Didn&apos;t make this change? Contact support right away so we can secure your account.
    </Text>
  </Layout>
)
