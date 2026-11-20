import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface OneTimeAccessProps {
  appName: string
  supportUrl: string
  code: string
  expiresIn: string
}

export const templateName = 'one-time-access'

export const previewProps = {
  ...sharedPreviewProps,
  code: 'GRYFFINDOR',
  expiresIn: '15 minutes'
} satisfies OneTimeAccessProps

export const templateProps = {
  ...sharedTemplateProps,
  code: '{{code}}',
  expiresIn: '{{expires_in}}'
} satisfies OneTimeAccessProps

export const Template = ({ appName, supportUrl, code, expiresIn }: OneTimeAccessProps) => (
  <Layout appName={appName} supportUrl={supportUrl} preview={`Your ${appName} sign-in code`}>
    <CardHeader title='Your sign-in code' />
    <Text>Enter this code on the sign-in screen to sign in to {appName}:</Text>
    <OneTimeCode>{code}</OneTimeCode>
    <Text>
      The code expires in {expiresIn} and works once. If you didn&apos;t request it, you can ignore
      this email; your account stays secure.
    </Text>
  </Layout>
)
