import { Column, Heading, Row } from 'jsx-email'
import { colors } from '../constants.ts'

/** The card's title, with an optional "Warning" tag for security notices. */
export function CardHeader({ title, warning }: { title: string; warning?: boolean }) {
  return (
    <Row style={{ marginBottom: '20px' }}>
      <Column style={{ verticalAlign: 'middle' }}>
        <Heading
          as='h1'
          style={{
            margin: 0,
            fontSize: '20px',
            lineHeight: '28px',
            fontWeight: 600,
            color: colors.heading
          }}
        >
          {title}
        </Heading>
      </Column>
      {warning && (
        <Column align='right' style={{ width: '80px', verticalAlign: 'middle' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '999px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 600
            }}
          >
            Warning
          </span>
        </Column>
      )}
    </Row>
  )
}
