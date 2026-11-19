/** Sample values the preview server renders with. */
export const sharedPreviewProps = {
  appName: 'Rusttp',
  supportUrl: 'https://example.com/the-leaky-cauldron'
}

/**
 * The placeholders `build.ts` renders into the compiled templates, filled at send time by the
 * server's template engine (Jinja-style, e.g. minijinja). Written without inner spaces:
 * html-to-text only drops a link's duplicate URL when the text equals the href verbatim.
 */
export const sharedTemplateProps = {
  appName: '{{app_name}}',
  supportUrl: '{{support_url}}'
}

export const fontFamily = 'Inter, Aptos, Arial, Helvetica, sans-serif'

export const colors = {
  brand: '#d9531e',
  heading: '#111827',
  text: '#374151',
  muted: '#6b7280',
  dimmed: '#b0b6bf',
  border: '#e5e7eb',
  page: '#f6f7f9',
  card: '#ffffff',
  panel: '#f9fafb',
  link: '#c2410c',
  button: '#111827'
} as const
