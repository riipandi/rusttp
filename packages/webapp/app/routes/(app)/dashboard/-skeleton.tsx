import * as stylex from '@stylexjs/stylex'
import { Skeleton } from 'uilibs/extra/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'uilibs/extra/table'
import { useMessages } from '#/libraries/messages'
import { styles } from '#/styles/pages/dashboard.stylex'

const summaryItems = ['one', 'two', 'three', 'four']
const loanRows = ['one', 'two', 'three', 'four', 'five']

// The placeholders keep the real layout, so nothing jumps when the data arrives; `aria-hidden`
// because the page carries `aria-busy` while they show.
export function SummarySkeleton() {
  return (
    <div aria-hidden='true' {...stylex.props(styles.summary)}>
      {summaryItems.map((item) => (
        <div key={item} {...stylex.props(styles.summaryItem)}>
          <Skeleton style={styles.skeletonLabel} />
          <Skeleton style={styles.skeletonValue} />
        </div>
      ))}
    </div>
  )
}

// The headers are static, so they stay real; only the rows wait for data.
export function LoansTableSkeleton() {
  const m = useMessages()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{m.loans_member()}</TableHead>
          <TableHead>{m.loans_book()}</TableHead>
          <TableHead>{m.loans_due()}</TableHead>
          <TableHead>{m.loans_status()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody aria-hidden='true'>
        {loanRows.map((row) => (
          <TableRow key={row}>
            <TableCell>
              <Skeleton style={styles.skeletonText} />
            </TableCell>
            <TableCell>
              <Skeleton style={styles.skeletonText} />
            </TableCell>
            <TableCell>
              <Skeleton style={styles.skeletonText} />
            </TableCell>
            <TableCell>
              <Skeleton style={styles.skeletonBadge} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
