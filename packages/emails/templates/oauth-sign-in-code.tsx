import { CardFooter, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface OauthSignInCodeProps {
  appName: string
  providerName: string
  code: string
  expiresIn: string
}

export const templateName = 'oauth-sign-in-code'

export const previewProps = {
  ...sharedPreviewProps,
  providerName: 'Hogwarts',
  code: 'EXPECTOPATRONUM',
  expiresIn: '15 minutes'
} satisfies OauthSignInCodeProps

export const templateProps = {
  ...sharedTemplateProps,
  providerName: '{{provider_name}}',
  code: '{{code}}',
  expiresIn: '{{expires_in}}'
} satisfies OauthSignInCodeProps

export const Template = ({ appName, providerName, code, expiresIn }: OauthSignInCodeProps) => (
  <Layout appName={appName} preview='Your sign-in code'>
    <CardHeader title='Finish signing in' />
    <Text>
      A sign-in with {providerName} named this email address. Enter this one-time code on the
      sign-in screen to prove it is yours and continue.
    </Text>
    <OneTimeCode>{code}</OneTimeCode>
    <Text>
      <strong>Important:</strong> this code expires in {expiresIn}.
    </Text>
    <Text>
      If you did not make this request, no action is needed: the sign-in cannot continue without
      this code.
    </Text>
    <CardFooter>
      <Text size='sm' muted>
        You&apos;re receiving this email because a {appName} sign-in through {providerName} carried
        this address.
        <br />
        If you are not sure why you&apos;re receiving this, please contact us.
      </Text>
    </CardFooter>
  </Layout>
)
