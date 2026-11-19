import { Markdown } from 'jsx-email'
import { CardFooter, CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { markdownStyles } from '../components/markdown.ts'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `body` is Markdown: rendered here for previews, passed through as text by the built template.

interface AnnouncementProps {
  appName: string
  name: string
  topic: string
  title: string
  body: string
}

export const templateName = 'announcement'

export const previewProps = {
  ...sharedPreviewProps,
  name: 'Hermione Granger',
  topic: 'Maintenance',
  title: 'Scheduled maintenance this weekend',
  body: 'The service will be briefly unavailable on **Sunday morning** while we upgrade the database.'
} satisfies AnnouncementProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  topic: '{{topic}}',
  title: '{{title}}',
  body: '{{body}}'
} satisfies AnnouncementProps

export const Template = ({ appName, name, topic, title, body }: AnnouncementProps) => (
  <Layout appName={appName} preview={title}>
    <CardHeader title='Announcement' />
    <Text>Hello {name},</Text>
    <Text>
      <strong>{title}</strong>
    </Text>
    <When value={topic}>
      <Text>
        Topic: <strong>{topic}</strong>
      </Text>
    </When>
    <Markdown markdownCustomStyles={markdownStyles}>{body}</Markdown>
    <CardFooter>
      <Text size='sm' muted>
        You&apos;re receiving this email because you have an account in {appName}.
        <br />
        You can read the announcement in your notification inbox after signing in.
      </Text>
    </CardFooter>
  </Layout>
)
