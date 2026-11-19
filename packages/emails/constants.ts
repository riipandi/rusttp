/** Sample values the preview server renders with. */
export const sharedPreviewProps = {
  appName: 'Rusttp'
}

/**
 * The placeholders `build.ts` renders into the compiled templates, filled at send time by the
 * server's template engine (Jinja-style, e.g. minijinja). Written without inner spaces:
 * html-to-text only drops a link's duplicate URL when the text equals the href verbatim.
 */
export const sharedTemplateProps = {
  appName: '{{app_name}}'
}

export const fontFamily = 'Inter, Aptos, Arial, Helvetica, sans-serif'

export const colors = {
  brand: '#d9531e',
  text: '#1a1a1a',
  muted: '#6b7280',
  border: '#e5e7eb',
  page: '#fbfbfb',
  card: '#ffffff',
  panel: '#f6f6f6',
  link: '#433eaf',
  button: '#0f172a'
} as const
