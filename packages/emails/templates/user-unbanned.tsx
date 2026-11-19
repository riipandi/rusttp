import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface UserUnbannedProps {
  appName: string
  name: string
}

export const templateName = 'user-unbanned'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Hermione Granger'
} satisfies UserUnbannedProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}'
} satisfies UserUnbannedProps

export const Template = ({ appName, name }: UserUnbannedProps) => (
  <Layout appName={appName} preview='Your account was reinstated'>
    <CardHeader title='Account reinstated' />
    <Text>Hello {name},</Text>
    <Text>
      Your account has been reinstated by an administrator. You can sign in again with your usual
      credentials.
    </Text>
    <AccountNotice appName={appName} />
  </Layout>
)
