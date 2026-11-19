import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface OneTimeAccessProps {
  appName: string
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

export const Template = ({ appName, code, expiresIn }: OneTimeAccessProps) => (
  <Layout appName={appName} preview='Your login code'>
    <CardHeader title='Your login code' />
    <Text>
      Enter this one-time code on the sign-in screen to sign in to {appName}. The code works once.
    </Text>
    <OneTimeCode>{code}</OneTimeCode>
    <Text>
      <strong>Important:</strong> this code expires in {expiresIn}.
    </Text>
    <Text>If you did not make this request, please ignore this email.</Text>
    <AccountNotice appName={appName} />
  </Layout>
)
