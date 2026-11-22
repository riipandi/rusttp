import * as stylex from '@stylexjs/stylex'
import { useFormat } from '#/libraries/format'
import { type Messages, useMessages } from '#/libraries/messages'
import type { SummaryItemResponse } from '#/schemas/loans.schema'
import { styles } from '#/styles/pages/dashboard.stylex'

// The API names a figure by id; the words are the interface's, so they follow the language.
const summaryLabel = (m: Messages): Record<SummaryItemResponse['id'], string> => ({
  'active-loans': m.summary_active_loans(),
  overdue: m.summary_overdue(),
  'new-members': m.summary_new_members(),
  'books-available': m.summary_books_available()
})

export function Summary({ items }: { items: SummaryItemResponse[] }) {
  const m = useMessages()
  const format = useFormat()
  return (
    <dl {...stylex.props(styles.summary)}>
      {items.map(({ id, value }) => (
        <div key={id} {...stylex.props(styles.summaryItem)}>
          <dt {...stylex.props(styles.summaryLabel)}>{summaryLabel(m)[id]}</dt>
          <dd {...stylex.props(styles.summaryValue)}>{format.number(value)}</dd>
        </div>
      ))}
    </dl>
  )
}
