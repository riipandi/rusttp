import { AccountNotice, CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview='Two-factor authentication was removed'>
    <CardHeader title='Two-factor authentication removed' warning />
    <Text>Hello {name},</Text>
    <Text>
      Two-factor authentication has been removed from your account by an administrator. You can now
      sign in with your password alone.
    </Text>
    <When
      value={reason}
      otherwise={<Text>If you are not sure why this was done, please contact us.</Text>}
    >
      <Text>
        Reason: <strong>{reason}</strong>
      </Text>
    </When>
    <Text>
      If you did not expect this, your account may be at risk. Please change your password and
      contact us immediately.
    </Text>
    <AccountNotice appName={appName} />
  </Layout>
)
