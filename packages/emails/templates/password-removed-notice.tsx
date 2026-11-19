import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface PasswordRemovedNoticeProps {
  appName: string
  supportUrl: string
  name: string
  email: string
}

export const templateName = 'password-removed-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Peter Solomon',
  email: 'peter.solomon@example.com'
} satisfies PasswordRemovedNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  email: '{{email}}'
} satisfies PasswordRemovedNoticeProps

export const Template = ({ appName, supportUrl, name, email }: PasswordRemovedNoticeProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview='The password for your account was removed'
  >
    <CardHeader title='Your password was removed' />
    <Text>Hi {name},</Text>
    <Text>
      The password for <strong>{email}</strong> was removed. You can still sign in with your other
      methods, such as a passkey or a connected account.
    </Text>
    <Alert variant='warning'>
      Didn&apos;t remove your password? Someone else may have access to your account. Contact
      support right away.
    </Alert>
  </Layout>
)
