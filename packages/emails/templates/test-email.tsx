import { Code } from 'jsx-email'
import { CardFooter, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface TestEmailProps {
  appName: string
  email: string
  smtpHost: string
  smtpPort: string
  sender: string
}

export const templateName = 'test-email'

export const previewProps = {
  ...sharedPreviewProps,
  email: 'dummy@example.com',
  smtpHost: 'smtp.example.com',
  smtpPort: '587',
  sender: 'Rusttp <noreply@example.com>'
} satisfies TestEmailProps

export const templateProps = {
  ...sharedTemplateProps,
  email: '{{email}}',
  smtpHost: '{{smtp_host}}',
  smtpPort: '{{smtp_port}}',
  sender: '{{sender}}'
} satisfies TestEmailProps

export const Template = ({ appName, email, smtpHost, smtpPort, sender }: TestEmailProps) => (
  <Layout appName={appName} preview='Your mailer works'>
    <CardHeader title='SMTP test successful' />
    <Text>This is a test email to verify that your SMTP configuration is working correctly.</Text>
    <Text>
      <strong>Recipient:</strong> {email}
    </Text>
    <Text size='sm' muted style={{ marginBottom: '4px' }}>
      Sent with:
    </Text>
    <Code language='ini' theme='github-light'>
      {`host = ${smtpHost}\nport = ${smtpPort}\nfrom = ${sender}`}
    </Code>
    <CardFooter>
      <Text size='sm' muted>
        If you received this email, your mailer is properly configured.
      </Text>
    </CardFooter>
  </Layout>
)
