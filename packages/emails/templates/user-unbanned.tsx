import { CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview='Your account has been restored'>
    <CardHeader title='Your account has been restored' />
    <Text>Hi {name},</Text>
    <Text>
      An administrator lifted the suspension on your account. You can sign in again as usual.
    </Text>
  </Layout>
)
