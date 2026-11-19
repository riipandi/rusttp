import { Markdown } from 'jsx-email'
import { CardHeader } from '../components/card.tsx'
import { Layout } from '../components/layout.tsx'
import { markdownStyles } from '../components/markdown.ts'
import { Text } from '../components/text.tsx'
import { When } from '../components/when.tsx'
import { sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// `body` is Markdown: rendered here for previews, passed through as text by the built template.

interface AnnouncementProps {
  appName: string
  supportUrl: string
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
  title: 'The Room of Requirement closes this weekend',
  body: 'Sign-ins pause on **Sunday morning** while the house-elves upgrade the database.'
} satisfies AnnouncementProps

export const templateProps = {
  ...sharedTemplateProps,
  name: '{{name}}',
  topic: '{{topic}}',
  title: '{{title}}',
  body: '{{body}}'
} satisfies AnnouncementProps

export const Template = ({ appName, supportUrl, name, topic, title, body }: AnnouncementProps) => (
  <Layout
    appName={appName}
    supportUrl={supportUrl}
    preview={title}
    footer={
      <>
        You&apos;re receiving this announcement because you have an account with {appName}. You can
        also find it in your notification inbox after you sign in.
      </>
    }
  >
    <When value={topic}>
      <Text size='sm' muted style={{ margin: '0 0 4px' }}>
        {topic}
      </Text>
    </When>
    <CardHeader title={title} />
    <Text>Hi {name},</Text>
    <Markdown markdownCustomStyles={markdownStyles}>{body}</Markdown>
  </Layout>
)
