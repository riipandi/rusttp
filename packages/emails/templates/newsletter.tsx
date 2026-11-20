import { Heading, Link as BaseLink } from 'jsx-email'
import { Layout } from '../components/layout.tsx'
import { RichContent } from '../components/rich-content.tsx'
import { Text } from '../components/text.tsx'
import { colors, sharedPreviewProps, sharedTemplateProps } from '../constants.ts'

// The body comes from elsewhere (a CMS, a Markdown render) as unstyled HTML plus a plain-text
// copy; `RichContent` styles it. `content_html` is trusted HTML, hence `|safe`.

interface NewsletterProps {
  appName: string
  supportUrl: string
  unsubscribeUrl: string
  issue: string
  date: string
  headline: string
  contentHtml: string
  contentText: string
}

export const templateName = 'newsletter'

export const previewProps = {
  ...sharedPreviewProps,
  unsubscribeUrl: 'https://example.com/unsubscribe?owl=hedwig',
  issue: 'Issue 7',
  date: 'March 2026',
  headline: 'Secrets hidden in plain sight',
  contentHtml: `
<p>This month we follow <strong>Robert Langdon</strong> through the Louvre after hours and borrow a few tricks from the <a href="https://example.com/journal/hogwarts-library">Hogwarts library</a>.</p>
<h2>Reading the Fibonacci sequence</h2>
<p>Sophie Neveu explains how a scrambled run of numbers became the key to a Zurich vault:</p>
<ol><li>Unscramble the numbers on the floor.</li><li>Read them as the account number.</li><li>Remember the rose.</li></ol>
<blockquote><p>So dark the con of man.</p></blockquote>
<h2>A guide to the Marauder's Map</h2>
<ul><li>Every footprint shows a name.</li><li>Every passage is drawn, even the ones that move.</li><li>Say <code>Mischief managed</code> when you are done.</li></ul>
<hr>
<p>Read the full issue in <a href="https://example.com/journal/7">the journal</a>.</p>`,
  contentText:
    'This month we follow Robert Langdon through the Louvre after hours and borrow a few tricks from the Hogwarts library.'
} satisfies NewsletterProps

export const templateProps = {
  ...sharedTemplateProps,
  unsubscribeUrl: '{{unsubscribe_url}}',
  issue: '{{issue}}',
  date: '{{date}}',
  headline: '{{headline}}',
  contentHtml: '{{content_html|safe}}',
  contentText: '{{content_text}}'
} satisfies NewsletterProps

export const Template = ({
  appName,
  supportUrl,
  unsubscribeUrl,
  issue,
  date,
  headline,
  contentHtml,
  contentText
}: NewsletterProps) => (
  <Layout
    wide
    appName={appName}
    supportUrl={supportUrl}
    preview={headline}
    footer={
      <>
        You&apos;re receiving the {appName} newsletter because you subscribed to it.{' '}
        <BaseLink
          href={unsubscribeUrl}
          data-dm='muted'
          style={{ color: colors.text, textDecoration: 'underline' }}
        >
          Unsubscribe
        </BaseLink>
        .
      </>
    }
  >
    <Text
      size='sm'
      data-dm='eyebrow'
      style={{
        margin: '0 0 8px',
        fontSize: '12px',
        color: colors.brand,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase'
      }}
    >
      {issue} &middot; {date}
    </Text>
    <Heading
      as='h1'
      style={{
        margin: '0 0 24px',
        fontSize: '23px',
        lineHeight: '30px',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: colors.heading
      }}
    >
      {headline}
    </Heading>
    <RichContent html={contentHtml} text={contentText} />
    <Text style={{ margin: '28px 0 16px' }}>
      Until next time,
      <br />
      <strong>The {appName} team</strong>
    </Text>
  </Layout>
)
