import { Column, Row, Section } from 'jsx-email'
import { colors } from '../constants.ts'
import { Text } from './text.tsx'

interface Detail {
  label: string
  value: string
}

/** Label/value pairs on a bordered panel, two per row. */
export function Details({ items }: { items: Detail[] }) {
  const rows: Detail[][] = []
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2))

  return (
    <Section
      data-dm='panel'
      style={{
        margin: '0 0 16px',
        padding: '4px 4px',
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.panel
      }}
    >
      {rows.map((row) => (
        <Row key={row.map((item) => item.label).join('|')}>
          {row.map((item) => (
            <Column
              key={item.label}
              style={{ width: '50%', padding: '10px 12px', verticalAlign: 'top' }}
            >
              <Text size='sm' muted style={{ margin: 0 }}>
                {item.label}
              </Text>
              <Text size='sm' style={{ margin: 0, color: colors.heading, wordBreak: 'break-word' }}>
                {item.value}
              </Text>
            </Column>
          ))}
        </Row>
      ))}
    </Section>
  )
}
