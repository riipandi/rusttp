import { Column, Heading, Hr, Row, Section } from 'jsx-email'
import type { ReactNode } from 'react'
import { colors } from '../constants.ts'
import { Text } from './text.tsx'

export function CardHeader({ title, warning }: { title: string; warning?: boolean }) {
  return (
    <>
      <Row>
        <Column>
          <Heading
            as='h1'
            style={{ fontSize: '22px', lineHeight: '30px', fontWeight: 'bold', margin: 0 }}
          >
            {title}
          </Heading>
        </Column>
        {warning && (
          <Column align='right' style={{ width: '90px' }}>
            <Text
              size='sm'
              style={{
                display: 'inline-block',
                margin: 0,
                padding: '2px 14px',
                borderRadius: '50px',
                backgroundColor: '#ffd966',
                color: '#7f6000'
              }}
            >
              Warning
            </Text>
          </Column>
        )}
      </Row>
      <Hr style={{ margin: '16px 0', borderColor: colors.border }} />
    </>
  )
}

export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <Section style={{ marginTop: '24px', borderTop: `1px solid ${colors.border}` }}>
      {children}
    </Section>
  )
}

/** The footer most account emails share. */
export function AccountNotice({ appName }: { appName: string }) {
  return (
    <CardFooter>
      <Text size='sm' muted>
        You&apos;re receiving this email because you have an account in {appName}.
        <br />
        If you are not sure why you&apos;re receiving this, please contact us.
      </Text>
    </CardFooter>
  )
}
