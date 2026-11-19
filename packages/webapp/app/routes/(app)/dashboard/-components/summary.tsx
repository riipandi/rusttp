import * as stylex from '@stylexjs/stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import { summary } from '../-data'

export function Summary() {
  return (
    <dl {...stylex.props(styles.summary)}>
      {summary.map(({ label, value }) => (
        <div key={label} {...stylex.props(styles.summaryItem)}>
          <dt {...stylex.props(styles.summaryLabel)}>{label}</dt>
          <dd {...stylex.props(styles.summaryValue)}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
