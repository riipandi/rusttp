import * as stylex from '@stylexjs/stylex'
import { m } from '#/paraglide/messages'
import type { SummaryItemResponse } from '#/schemas/loans.schema'
import { styles } from '#/styles/pages/dashboard.stylex'

// The API names a figure by id; the words are the interface's, so they follow the language.
const summaryLabel: Record<SummaryItemResponse['id'], () => string> = {
  'active-loans': m.summary_active_loans,
  overdue: m.summary_overdue,
  'new-members': m.summary_new_members,
  'books-available': m.summary_books_available
}

export function Summary({ items }: { items: SummaryItemResponse[] }) {
  return (
    <dl {...stylex.props(styles.summary)}>
      {items.map(({ id, value }) => (
        <div key={id} {...stylex.props(styles.summaryItem)}>
          <dt {...stylex.props(styles.summaryLabel)}>{summaryLabel[id]()}</dt>
          <dd {...stylex.props(styles.summaryValue)}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
