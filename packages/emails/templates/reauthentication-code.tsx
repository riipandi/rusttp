import { CardFooter, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface ReauthenticationCodeProps {
  appName: string
  code: string
  expiresIn: string
}

export const templateName = 'reauthentication-code'

export const previewProps = {
  ...sharedPreviewProps,
  code: 'EXPECTOPATRONUM',
  expiresIn: '15 minutes'
} satisfies ReauthenticationCodeProps

export const templateProps = {
  ...sharedTemplateProps,
  code: '{{code}}',
  expiresIn: '{{expires_in}}'
} satisfies ReauthenticationCodeProps

export const Template = ({ appName, code, expiresIn }: ReauthenticationCodeProps) => (
  <Layout appName={appName} preview='Confirm it is you'>
    <CardHeader title='Confirm it is you' />
    <Text>
      Enter this one-time code on the confirmation screen to continue. The code works once.
    </Text>
    <OneTimeCode>{code}</OneTimeCode>
    <Text>
      <strong>Important:</strong> this code expires in {expiresIn}.
    </Text>
    <Text>
      If you did not make this request, please protect your account and sign out of your other
      sessions.
    </Text>
    <CardFooter>
      <Text size='sm' muted>
        You&apos;re receiving this email because a sensitive action on your {appName} account asked
        for a confirmation.
        <br />
        If you are not sure why you&apos;re receiving this, please contact us.
      </Text>
    </CardFooter>
  </Layout>
)
