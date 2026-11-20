import {
  Body,
  ColorScheme,
  Column,
  Conditional,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Raw,
  Row,
  Section,
  Text
} from 'jsx-email'
import type { CSSProperties, ReactNode } from 'react'
import { colors, fontFamily } from '../constants.ts'
import { Logo } from './logo.tsx'

// Dark mode and phone-width overrides. Clients that honour `prefers-color-scheme` (Apple Mail,
// iOS, Outlook for Mac) get the dark palette; the rest keep the light one, which `ColorScheme`
// declares as supported alongside dark. The inline plugin inlines every `<style>` rule, drops the stylesheets, and strips `class`, so
// these sheets go in through `Raw` (which it never sees) and target `data-dm` attributes.
const headStyles = `<style>
@media (prefers-color-scheme: dark) {
  [data-dm=body] { background-color: #0b0f17 !important; }
  [data-dm=card] { background-color: #111827 !important; border-color: #1f2937 !important; }
  [data-dm=card] h1, [data-dm=card] h2, [data-dm=card] p, [data-dm=card] td,
  [data-dm=brand] { color: #e5e7eb !important; }
  [data-dm=card] [data-dm=alert] { color: #1f2937 !important; }
  [data-dm=panel] { background-color: #1f2937 !important; border-color: #374151 !important; }
  [data-dm=muted], [data-dm=body] [data-dm=muted] { color: #9ca3af !important; }
  [data-dm=link], [data-dm=card] [data-dm=eyebrow] { color: #fb8f5a !important; }
  [data-dm=rule] { border-color: #1f2937 !important; }
}
@media (max-width: 480px) {
  [data-dm=body] { padding: 24px 12px !important; }
  [data-dm=card-body] { padding: 24px 20px !important; }
  [data-dm=wide-break] { display: none !important; }
}
</style>`

// Outlook for Windows ignores the font stack and falls back to Times New Roman.
const outlookFontStyles =
  '<style>body, table, td, p, a, h1, h2, h3 { font-family: Arial, Helvetica, sans-serif !important; }</style>'

const footerBrand = {
  margin: 0,
  fontSize: '12px',
  lineHeight: '16px',
  fontWeight: 600,
  color: colors.muted
} satisfies CSSProperties

const footerText = {
  margin: 0,
  fontSize: '12px',
  lineHeight: '20px',
  color: colors.muted
} satisfies CSSProperties

const footerLink = { color: colors.text, textDecoration: 'underline' } satisfies CSSProperties

interface LayoutProps {
  appName: string
  /** A wider card with more padding, for long reads such as the newsletter. */
  wide?: boolean
  /** Where "contact support" in the default footer points. */
  supportUrl: string
  /** The inbox preview line shown after the subject. */
  preview: string
  /** The note at the foot of the card; defaults to the account notice most emails share. */
  footer?: ReactNode
  children: ReactNode
}

export function Layout({ appName, wide, supportUrl, preview, footer, children }: LayoutProps) {
  return (
    <Html lang='en'>
      <Head>
        <ColorScheme mode='light dark' />
        <Raw content={headStyles} />
        <Conditional head mso>
          <Raw content={outlookFontStyles} />
        </Conditional>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        data-dm='body'
        style={{
          margin: 0,
          padding: '32px 16px',
          backgroundColor: colors.page,
          fontFamily,
          color: colors.text
        }}
      >
        <Container containerWidth={wide ? 640 : 560}>
          {/* Padding sits on the cell, not the table: Outlook ignores it on tables. */}
          <Section
            data-dm='card'
            style={{
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.card
            }}
          >
            <Row>
              <Column data-dm='card-body' style={{ padding: wide ? '40px' : '32px' }}>
                {children}
                {/* Every block above ends with a 16px margin, so the rule sits 24px below it. */}
                <Hr data-dm='rule' style={{ margin: '8px 0 20px', borderColor: colors.border }} />
                <Text data-dm='muted' style={footerText}>
                  {footer ?? (
                    <>
                      You&apos;re receiving this email because you have an account with {appName}
                      .&nbsp;
                      {/* Breaks only on wider screens; the phone query hides it (see headStyles). The
                          space before it is non-breaking because the minifier drops a plain one. */}
                      <br data-dm='wide-break' />
                      Something wrong?{' '}
                      <Link href={supportUrl} data-dm='muted' style={footerLink}>
                        Contact support
                      </Link>
                      .
                    </>
                  )}
                </Text>
              </Column>
            </Row>
          </Section>
          <Row align='center' width={undefined} style={{ margin: '24px auto 0' }}>
            <Column style={{ verticalAlign: 'middle' }}>
              <Logo size={14} color={colors.dimmed} />
            </Column>
            <Column style={{ paddingLeft: '6px', verticalAlign: 'middle' }}>
              <Text data-dm='muted' style={footerBrand}>
                {appName}
              </Text>
            </Column>
          </Row>
        </Container>
      </Body>
    </Html>
  )
}
