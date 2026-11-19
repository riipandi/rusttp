import { Alert } from '../components/alert.tsx'
import { CardHeader } from '../components/card.tsx'
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
  <Layout appName={appName} preview='Confirm the change to your email address'>
    <CardHeader title='Confirm your new email address' />
    <Text>Hi {name},</Text>
    <Text>We received a request to change the email address on your account:</Text>
    <Details
      items={[
        { label: 'Current email', value: oldEmail },
        { label: 'New email', value: newEmail }
      ]}
    />
    <Text>Enter this code on the confirmation screen to finish the change:</Text>
    <OneTimeCode>{confirmCode}</OneTimeCode>
    <Alert variant='warning'>
      The code expires in 24 hours and works once. If you didn&apos;t request this change, ignore
      this email and your current address stays the same.
    </Alert>
  </Layout>
)
