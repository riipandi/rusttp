import { Alert } from '../components/alert.tsx'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Details } from '../components/details.tsx'
import { Layout } from '../components/layout.tsx'
import { OneTimeCode } from '../components/one-time-code.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface EmailChangeRequestProps {
  appName: string
  name: string
  oldEmail: string
  newEmail: string
  confirmCode: string
}

export const templateName = 'email-change-request'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'John Doe',
  oldEmail: 'current@example.com',
  newEmail: 'new@example.com',
  confirmCode: 'CHAMBER-SECRETS'
} satisfies EmailChangeRequestProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  oldEmail: '{{old_email}}',
  newEmail: '{{new_email}}',
  confirmCode: '{{confirm_code}}'
} satisfies EmailChangeRequestProps

export const Template = ({
  appName,
  name,
  oldEmail,
  newEmail,
  confirmCode
}: EmailChangeRequestProps) => (
  <Layout appName={appName} preview='Confirm your new email address'>
    <CardHeader title='Email change request' />
    <Text>Hello {name},</Text>
    <Text>You requested to change your email address:</Text>
    <Details
      items={[
        { label: 'Current email', value: oldEmail },
        { label: 'New email', value: newEmail }
      ]}
    />
    <Text>
      Use the code below to confirm this change. Type it on the change screen; the code works once.
    </Text>
    <OneTimeCode>{confirmCode}</OneTimeCode>
    <Alert variant='warning'>
      <strong>Important:</strong> this code expires in 24 hours. If you did not request this change,
      please ignore this email.
    </Alert>
    <AccountNotice appName={appName} />
  </Layout>
)
