import { BookOpen } from '@keyline-icons/react'
import { Badge, type BadgeProps } from 'uilibs/extra/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'uilibs/extra/empty'
import { Icon } from 'uilibs/extra/icon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'uilibs/extra/table'
import { type Messages, useMessages } from '#/libraries/messages'
import type { LoanResponse, LoanStatus } from '#/schemas/loans.schema'
import { styles } from '#/styles/pages/dashboard.stylex'

const statusBadge: Record<LoanStatus, Pick<BadgeProps, 'variant' | 'tone'>> = {
  Borrowed: { variant: 'secondary' },
  'Due soon': { variant: 'outline' },
  Overdue: { tone: 'critical' },
  Returned: { variant: 'ghost' }
}

const statusLabel = (m: Messages): Record<LoanStatus, string> => ({
  Borrowed: m.loans_status_borrowed(),
  'Due soon': m.loans_status_due_soon(),
  Overdue: m.loans_status_overdue(),
  Returned: m.loans_status_returned()
})

export function LoansTable({ loans }: { loans: LoanResponse[] }) {
  const m = useMessages()
  if (loans.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Icon svg={BookOpen} size={16} />
          </EmptyMedia>
          <EmptyTitle>{m.loans_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.loans_empty_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table labels={{ region: m.dashboard_recent_loans() }}>
      <TableHeader>
        <TableRow>
          <TableHead>{m.loans_member()}</TableHead>
          <TableHead>{m.loans_book()}</TableHead>
          <TableHead>{m.loans_due()}</TableHead>
          <TableHead>{m.loans_status()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell>{loan.member}</TableCell>
            <TableCell style={styles.muted}>{loan.book}</TableCell>
            <TableCell style={styles.muted}>{loan.due}</TableCell>
            <TableCell>
              <Badge {...statusBadge[loan.status]}>{statusLabel(m)[loan.status]}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
