import { Column, Row, Section } from 'jsx-email'
import { colors } from '../constants.ts'
import { Text } from './text.tsx'

interface Detail {
  label: string
  value: string
}

/** Label/value pairs on a tinted panel, two per row. */
export function Details({ items }: { items: Detail[] }) {
  const rows: Detail[][] = []
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2))

  return (
    <Section
      data-dm='panel'
      style={{ backgroundColor: colors.panel, borderRadius: '12px', margin: '8px 0 16px' }}
    >
      {rows.map((row) => (
        <Row key={row.map((item) => item.label).join('|')}>
          {row.map((item) => (
            <Column
              key={item.label}
              style={{ width: '50%', padding: '12px', verticalAlign: 'top' }}
            >
              <Text size='sm' muted style={{ margin: 0 }}>
                {item.label}
              </Text>
              <Text size='sm' style={{ margin: 0, wordBreak: 'break-word' }}>
                {item.value}
              </Text>
            </Column>
          ))}
        </Row>
      ))}
    </Section>
  )
}
