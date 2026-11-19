import { Code } from 'jsx-email'
import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { colors, sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

interface TestEmailProps {
  appName: string
  supportUrl: string
  email: string
  smtpHost: string
  smtpPort: string
  sender: string
}

export const templateName = 'test-email'

export const previewProps = {
  ...sharedPreviewProps,
  email: 'albus.dumbledore@example.com',
  smtpHost: 'smtp.example.com',
  smtpPort: '587',
  sender: 'Hogwarts Owl Post <owlpost@example.com>'
} satisfies TestEmailProps

export const templateProps = {
  ...sharedTemplateProps,
  email: '{{email}}',
  smtpHost: '{{smtp_host}}',
  smtpPort: '{{smtp_port}}',
  sender: '{{sender}}'
} satisfies TestEmailProps

export const Template = ({
  appName,
  supportUrl,
  email,
  smtpHost,
  smtpPort,
  sender
}: TestEmailProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview={`${appName} can send email`}
    footer={
      <>
        You&apos;re receiving this email because someone sent a test message from the email settings
        of {appName}.
      </>
    }
  >
    <CardHeader title='Your email settings work' />
    <Text>
      This test message confirms that {appName} can send email with the current SMTP settings. It
      was delivered to <strong>{email}</strong>.
    </Text>
    <Text size='sm' muted style={{ marginBottom: '4px' }}>
      Settings used:
    </Text>
    <Code
      language='ini'
      theme='github-light'
      style={{
        margin: '0 0 16px',
        padding: '12px 16px',
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        // github-light paints its own white background inside.
        backgroundColor: '#ffffff',
        fontSize: '13px',
        lineHeight: '20px'
      }}
    >
      {`host = ${smtpHost}\nport = ${smtpPort}\nfrom = ${sender}`}
    </Code>
  </Layout>
)
