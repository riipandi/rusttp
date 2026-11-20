import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `expires_at` is empty when the suspension never lifts.

interface UserBannedProps {
  appName: string
  supportUrl: string
  name: string
  reason: string
  expiresAt: string
}

export const templateName = 'user-banned'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Draco Malfoy',
  reason: 'Hexing other students in the corridors',
  expiresAt: 'September 1, 2026'
} satisfies UserBannedProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  reason: '{{reason}}',
  expiresAt: '{{expires_at}}'
} satisfies UserBannedProps

export const Template = ({ appName, supportUrl, name, reason, expiresAt }: UserBannedProps) => (
  <Layout appName={appName} supportUrl={supportUrl} preview='Your account has been suspended'>
    <CardHeader title='Your account has been suspended' warning />
    <Text>Hi {name},</Text>
    <Text>An administrator suspended your account, so you can&apos;t sign in right now.</Text>
    <Text>
      Reason: <strong>{reason}</strong>
    </Text>
    <When
      value={expiresAt}
      otherwise={
        <Text>
          This suspension has no end date. If you think it&apos;s a mistake, contact support.
        </Text>
      }
    >
      <Text>
        The suspension ends on <strong>{expiresAt}</strong>. You can sign in again after that.
      </Text>
    </When>
  </Layout>
)
