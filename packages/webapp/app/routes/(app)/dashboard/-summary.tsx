import * as stylex from '@stylexjs/stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import type { SummaryItem } from './-types'

export function Summary({ items }: { items: SummaryItem[] }) {
  return (
    <dl {...stylex.props(styles.summary)}>
      {items.map(({ label, value }) => (
        <div key={label} {...stylex.props(styles.summaryItem)}>
          <dt {...stylex.props(styles.summaryLabel)}>{label}</dt>
          <dd {...stylex.props(styles.summaryValue)}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
