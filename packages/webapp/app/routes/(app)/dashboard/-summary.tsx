import * as stylex from '@stylexjs/stylex'
import type { SummaryItemResponse } from '#/schemas/loans.schema'
import { styles } from '#/styles/pages/dashboard.stylex'

export function Summary({ items }: { items: SummaryItemResponse[] }) {
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
