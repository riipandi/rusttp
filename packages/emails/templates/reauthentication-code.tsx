import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface ReauthenticationCodeProps {
  appName: string
  supportUrl: string
  code: string
  expiresIn: string
}

export const templateName = 'reauthentication-code'

export const previewProps = {
  ...sharedPreviewProps,
  code: 'MISCHIEF-MANAGED',
  expiresIn: '10 minutes'
} satisfies ReauthenticationCodeProps

export const templateProps = {
  ...sharedTemplateProps,
  code: '{{code}}',
  expiresIn: '{{expires_in}}'
} satisfies ReauthenticationCodeProps

export const Template = ({ appName, supportUrl, code, expiresIn }: ReauthenticationCodeProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview='Your confirmation code'
    footer={
      <>
        You&apos;re receiving this email because a sensitive action on your {appName} account needed
        confirmation.
      </>
    }
  >
    <CardHeader title="Confirm it's you" />
    <Text>
      You&apos;re about to make a sensitive change to your {appName} account. Enter this code on the
      confirmation screen to continue:
    </Text>
    <OneTimeCode>{code}</OneTimeCode>
    <Text>
      The code expires in {expiresIn} and works once. If you didn&apos;t start this, change your
      password and sign out of your other sessions.
    </Text>
  </Layout>
)
