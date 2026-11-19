import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `reason` is empty when the operator wrote none.

interface MfaDisabledNoticeProps {
  appName: string
  name: string
  reason: string
}

export const templateName = 'mfa-disabled-notice'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Hermione Granger',
  reason: 'Lost authenticator device, verified over support'
} satisfies MfaDisabledNoticeProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  reason: '{{reason}}'
} satisfies MfaDisabledNoticeProps

export const Template = ({ appName, name, reason }: MfaDisabledNoticeProps) => (
  <Layout appName={appName} preview='Two-factor authentication was turned off for your account'>
    <CardHeader title='Two-factor authentication was turned off' warning />
    <Text>Hi {name},</Text>
    <Text>
      An administrator turned off two-factor authentication for your account. You can now sign in
      with your password alone.
    </Text>
    <When value={reason} otherwise={<Text>No reason was given.</Text>}>
      <Text>
        Reason: <strong>{reason}</strong>
      </Text>
    </When>
    <Text>
      We recommend turning it back on in your security settings. If you didn&apos;t expect this,
      change your password and contact support right away.
    </Text>
  </Layout>
)
