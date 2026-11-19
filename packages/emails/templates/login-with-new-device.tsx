import { CardHeader } from '../components/card.tsx'
import { Details } from '../components/details.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// The server formats `location` ("City, Country", "Country", or "Unknown") and `date_time`.

interface LoginWithNewDeviceProps {
  appName: string
  supportUrl: string
  location: string
  ipAddress: string
  device: string
  dateTime: string
}

export const templateName = 'login-with-new-device'

export const previewProps = {
  ...sharedPreviewProps,
  location: 'Paris, France',
  ipAddress: '203.0.113.42',
  device: 'Safari on macOS',
  dateTime: 'March 21, 2026 at 11:47 PM CET'
} satisfies LoginWithNewDeviceProps

export const templateProps = {
  ...sharedTemplateProps,
  location: '{{location}}',
  ipAddress: '{{ip_address}}',
  device: '{{device}}',
  dateTime: '{{date_time}}'
} satisfies LoginWithNewDeviceProps

export const Template = ({
  appName,
  supportUrl,
  location,
  ipAddress,
  device,
  dateTime
}: LoginWithNewDeviceProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview={`New sign-in to your ${appName} account`}
  >
    <CardHeader title='New sign-in to your account' warning />
    <Text>
      Someone signed in to your {appName} account from a device or location we haven&apos;t seen
      before:
    </Text>
    <Details
      items={[
        { label: 'Location', value: location },
        { label: 'IP address', value: ipAddress },
        { label: 'Device', value: device },
        { label: 'Time', value: dateTime }
      ]}
    />
    <Text>
      If this was you, there&apos;s nothing to do. If it wasn&apos;t, change your password right
      away and sign out of any sessions you don&apos;t recognize.
    </Text>
  </Layout>
)
