import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `expires_at` is empty when the suspension never lifts.

interface UserBannedProps {
  appName: string
  name: string
  reason: string
  expiresAt: string
}

export const templateName = 'user-banned'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Hermione Granger',
  reason: 'Repeated violations of the community guidelines',
  expiresAt: 'October 7, 2024'
} satisfies UserBannedProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  reason: '{{reason}}',
  expiresAt: '{{expires_at}}'
} satisfies UserBannedProps

export const Template = ({ appName, name, reason, expiresAt }: UserBannedProps) => (
  <Layout appName={appName} preview='Your account was suspended'>
    <CardHeader title='Account suspended' warning />
    <Text>Hello {name},</Text>
    <Text>
      Your account has been suspended by an administrator and can no longer be used to sign in.
    </Text>
    <Text>
      Reason: <strong>{reason}</strong>
    </Text>
    <When
      value={expiresAt}
      otherwise={
        <Text>
          This suspension does not lift on its own. If you believe it was applied in error, please
          contact us.
        </Text>
      }
    >
      <Text>
        The suspension lifts on <strong>{expiresAt}</strong>, after which you can sign in again.
      </Text>
    </When>
    <AccountNotice appName={appName} />
  </Layout>
)
