import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface OauthSignInCodeProps {
  appName: string
  supportUrl: string
  providerName: string
  code: string
  expiresIn: string
}

export const templateName = 'oauth-sign-in-code'

export const previewProps = {
  ...sharedPreviewProps,
  providerName: 'Hogwarts',
  code: 'EXPECTO-PATRONUM',
  expiresIn: '15 minutes'
} satisfies OauthSignInCodeProps

export const templateProps = {
  ...sharedTemplateProps,
  providerName: '{{provider_name}}',
  code: '{{code}}',
  expiresIn: '{{expires_in}}'
} satisfies OauthSignInCodeProps

export const Template = ({
  appName,
  supportUrl,
  providerName,
  code,
  expiresIn
}: OauthSignInCodeProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview={`Your code to finish signing in with ${providerName}`}
    footer={
      <>
        You&apos;re receiving this email because a sign-in to {appName} through {providerName} used
        this address.
      </>
    }
  >
    <CardHeader title='Finish signing in' />
    <Text>
      Someone is signing in to {appName} with {providerName} using this email address. Enter this
      code on the sign-in screen to confirm it&apos;s you:
    </Text>
    <OneTimeCode>{code}</OneTimeCode>
    <Text>
      The code expires in {expiresIn} and works once. If you didn&apos;t try to sign in, you can
      ignore this email: no one can finish signing in without this code.
    </Text>
  </Layout>
)
