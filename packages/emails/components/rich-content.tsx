import { Conditional, Raw } from 'jsx-email'
import { colors } from '../constants.ts'

/**
 * Styles for HTML that arrives without any (a CMS body, a Markdown render). They go in through
 * `Raw`, like the head styles, because the inline plugin drops `<style>` and `class`; the server's
 * HTML is inserted after the build, so nothing could inline it anyway. Clients that ignore
 * `<style>` show the content with their own defaults.
 */
const richStyles = `<style>
.rich-content p { margin: 0 0 16px; font-size: 15px; line-height: 25px; color: ${colors.text}; }
.rich-content h1, .rich-content h2, .rich-content h3, .rich-content h4 {
  margin: 32px 0 8px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em;
  color: ${colors.heading};
}
.rich-content h3, .rich-content h4 { margin-top: 24px; }
.rich-content h1 { font-size: 20px; }
.rich-content h2 { font-size: 18px; }
.rich-content h3 { font-size: 16px; }
.rich-content h4 { font-size: 15px; }
.rich-content ul, .rich-content ol { margin: 0 0 16px; padding: 0 0 0 22px; }
.rich-content li { margin: 0 0 4px; padding-left: 4px; font-size: 15px; line-height: 25px; color: ${colors.text}; }
.rich-content li::marker { color: ${colors.muted}; }
.rich-content a { color: ${colors.link}; text-decoration: underline; text-underline-offset: 2px; }
.rich-content strong, .rich-content b { font-weight: 600; color: ${colors.heading}; }
.rich-content blockquote {
  margin: 20px 0; padding: 2px 0 2px 16px; border-left: 3px solid ${colors.brand};
  font-style: italic; color: ${colors.heading};
}
.rich-content blockquote p { font-size: 16px; color: ${colors.heading}; }
.rich-content blockquote > :last-child, .rich-content li > :last-child { margin-bottom: 0; }
.rich-content img { display: block; max-width: 100%; height: auto; margin: 20px 0; border: 0; border-radius: 8px; }
.rich-content hr { margin: 28px 0; border: 0; border-top: 1px solid ${colors.border}; }
.rich-content code {
  padding: 2px 5px; border-radius: 4px; background-color: #f3f4f6; font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.rich-content pre {
  margin: 0 0 16px; padding: 12px 16px; border: 1px solid ${colors.border}; border-radius: 8px;
  background-color: ${colors.panel}; font-size: 13px; line-height: 21px; overflow-x: auto;
}
.rich-content pre code { padding: 0; background-color: transparent; }
.rich-content table { width: 100%; margin: 0 0 16px; border-collapse: collapse; }
.rich-content th, .rich-content td {
  padding: 10px 8px; border-bottom: 1px solid ${colors.border}; text-align: left; font-size: 14px;
}
.rich-content th { font-weight: 600; color: ${colors.heading}; }
.rich-content > :first-child { margin-top: 0; }
/* A heading right after a rule or quote already has the gap above it. */
.rich-content hr + h1, .rich-content hr + h2, .rich-content hr + h3 { margin-top: 0; }
.rich-content > :last-child { margin-bottom: 0; }
@media (prefers-color-scheme: dark) {
  .rich-content p, .rich-content li, .rich-content td { color: #e5e7eb !important; }
  .rich-content h1, .rich-content h2, .rich-content h3, .rich-content h4,
  .rich-content strong, .rich-content b, .rich-content th { color: #f3f4f6 !important; }
  .rich-content a { color: #fb8f5a !important; }
  .rich-content blockquote, .rich-content blockquote p { color: #f3f4f6 !important; }
  .rich-content code, .rich-content pre { background-color: #1f2937 !important; }
  .rich-content pre, .rich-content hr, .rich-content th, .rich-content td {
    border-color: #374151 !important;
  }
}
</style>`

interface RichContentProps {
  /** The HTML body. In the built template a `{{name|safe}}` placeholder. */
  html: string
  /** The same body as plain text, for the text part. */
  text: string
}

/** Inserts an HTML body with default styles for its paragraphs, lists, headings, and the rest. */
export function RichContent({ html, text }: RichContentProps) {
  return (
    <>
      <Raw content={richStyles} disablePlainTextOutput />
      {/* `Raw` keeps the class: the inline plugin strips it from regular elements. */}
      <Raw content={`<div class="rich-content">${html}</div>`} disablePlainTextOutput />
      {/* Hidden in HTML (Outlook ignores `display: none`, hence the conditional); html-to-text
          ignores both, so the text part carries the plain body. */}
      <Conditional expression='!mso'>
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{text}</div>
      </Conditional>
    </>
  )
}
