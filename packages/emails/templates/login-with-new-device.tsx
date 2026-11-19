import { Heading } from 'jsx-email'
import { AccountNotice, CardHeader } from '../components/card.tsx'
import { Details } from '../components/details.tsx'
import { Layout } from '../components/layout.tsx'
import { Text } from '../components/text.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// The server formats `location` ("City, Country", "Country", or "Unknown") and `date_time`.

interface LoginWithNewDeviceProps {
  appName: string
  location: string
  ipAddress: string
  device: string
  dateTime: string
}

export const templateName = 'login-with-new-device'

export const previewProps = {
  ...sharedPreviewProps,
  location: 'San Francisco, USA',
  ipAddress: '127.0.0.1',
  device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
  dateTime: 'January 1, 2024 at 12:00 PM UTC'
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
  location,
  ipAddress,
  device,
  dateTime
}: LoginWithNewDeviceProps) => (
  <Layout appName={appName} preview='New sign-in to your account'>
    <CardHeader title='New sign-in detected' warning />
    <Text>
      Your {appName} account was recently accessed from a new IP address or browser. If you
      recognize this activity, no further action is required.
    </Text>
    <Heading as='h2' style={{ fontSize: '16px', fontWeight: 'bold', margin: '16px 0 8px' }}>
      Details
    </Heading>
    <Details
      items={[
        { label: 'Location', value: location },
        { label: 'IP address', value: ipAddress },
        { label: 'Device', value: device },
        { label: 'Time', value: dateTime }
      ]}
    />
    <AccountNotice appName={appName} />
  </Layout>
)
