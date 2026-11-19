import {
  Body,
  ColorScheme,
  Column,
  Conditional,
  Container,
  Head,
  Html,
  Preview,
  Raw,
  Row,
  Section,
  Text
} from 'jsx-email'
import type { ReactNode } from 'react'
import { colors, fontFamily } from '../constants.ts'
import { Logo } from './logo.tsx'

// Clients that honour `prefers-color-scheme` (Apple Mail, iOS, Outlook for Mac) get these; the
// rest keep the light palette, which `ColorScheme` declares as supported alongside dark.
// The inline plugin inlines every `<style>` rule, drops the stylesheets, and strips `class`, so
// these sheets go in through `Raw` (which it never sees) and target `data-dm` attributes.
const darkModeStyles = `<style>
@media (prefers-color-scheme: dark) {
  [data-dm=body] { background-color: #0b1120 !important; color: #e5e7eb !important; }
  [data-dm=card] { background-color: #111827 !important; box-shadow: none !important; }
  [data-dm=panel] { background-color: #1f2937 !important; }
  [data-dm=muted] { color: #9ca3af !important; }
  [data-dm=link] { color: #a5b4fc !important; }
}
</style>`

// Outlook for Windows ignores the font stack and falls back to Times New Roman.
const outlookFontStyles =
  '<style>body, table, td, p, a, h1, h2, h3 { font-family: Arial, Helvetica, sans-serif !important; }</style>'

interface LayoutProps {
  appName: string
  /** The inbox preview line shown after the subject. */
  preview: string
  children: ReactNode
}

export function Layout({ appName, preview, children }: LayoutProps) {
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
          padding: '24px',
          backgroundColor: colors.page,
          fontFamily,
          fontSize: '16px',
          lineHeight: '1.6',
          color: colors.text
        }}
      >
        <Container containerWidth={620}>
          <Section>
            <Row style={{ marginBottom: '16px' }}>
              <Column style={{ width: '40px' }}>
                <Logo />
              </Column>
              <Column>
                <Text
                  style={{ fontSize: '22px', lineHeight: '28px', fontWeight: 'bold', margin: 0 }}
                >
                  {appName}
                </Text>
              </Column>
            </Row>
          </Section>
          <Section
            data-dm='card'
            style={{
              backgroundColor: colors.card,
              padding: '32px',
              borderRadius: '10px',
              boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
