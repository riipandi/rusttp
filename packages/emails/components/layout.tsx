import { Body, ColorScheme, Column, Conditional, Container, Head } from 'jsx-email'
import { Html, Preview, Raw, Row, Section, Text } from 'jsx-email'
import type { ReactNode } from 'react'
import { colors, fontFamily } from '../constants.ts'
import { Logo } from './logo.tsx'

// Clients that honour `prefers-color-scheme` (Apple Mail, iOS, Outlook for Mac) get these; the
// rest keep the light palette, which `ColorScheme` declares as supported alongside dark.
// The inline plugin inlines every `<style>` rule, drops the stylesheets, and strips `class`, so
// these sheets go in through `Raw` (which it never sees) and target `data-dm` attributes.
const darkModeStyles = `<style>
@media (prefers-color-scheme: dark) {
  [data-dm=body] { background-color: #0b0f17 !important; }
  [data-dm=card] { background-color: #111827 !important; border-color: #1f2937 !important; }
  [data-dm=card] h1, [data-dm=card] h2, [data-dm=card] p, [data-dm=card] td,
  [data-dm=brand] { color: #e5e7eb !important; }
  [data-dm=card] [data-dm=alert] { color: #1f2937 !important; }
  [data-dm=panel] { background-color: #1f2937 !important; border-color: #374151 !important; }
  [data-dm=muted], [data-dm=body] [data-dm=muted] { color: #9ca3af !important; }
  [data-dm=link] { color: #fb8f5a !important; }
}
</style>`

// Outlook for Windows ignores the font stack and falls back to Times New Roman.
const outlookFontStyles =
  '<style>body, table, td, p, a, h1, h2, h3 { font-family: Arial, Helvetica, sans-serif !important; }</style>'

interface LayoutProps {
  appName: string
  /** The inbox preview line shown after the subject. */
  preview: string
  /** The note under the card; defaults to the account notice most emails share. */
  footer?: ReactNode
  children: ReactNode
}

export function Layout({ appName, preview, footer, children }: LayoutProps) {
  return (
    <Html lang='en'>
      <Head>
        <ColorScheme mode='light dark' />
        <Raw content={darkModeStyles} />
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
        <Container containerWidth={560}>
          <Section style={{ padding: '0 4px 20px' }}>
            <Row>
              <Column style={{ width: '30px', verticalAlign: 'middle' }}>
                <Logo />
              </Column>
              <Column style={{ paddingLeft: '8px', verticalAlign: 'middle' }}>
                <Text
                  data-dm='brand'
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 600,
                    color: colors.heading
                  }}
                >
                  {appName}
                </Text>
              </Column>
            </Row>
          </Section>
          <Section
            data-dm='card'
            style={{
              padding: '32px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.card
            }}
          >
            {children}
          </Section>
          <Section style={{ padding: '20px 4px 0' }}>
            <Text
              data-dm='muted'
              style={{ margin: 0, fontSize: '12px', lineHeight: '18px', color: colors.muted }}
            >
              {footer ?? (
                <>
                  You&apos;re receiving this email because you have an account with {appName}. If
                  something looks wrong, contact support.
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
