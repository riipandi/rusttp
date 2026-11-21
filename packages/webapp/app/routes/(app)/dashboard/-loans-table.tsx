import { BookOpen } from '@keyline-icons/react'
import { Badge, type BadgeProps } from 'uilibs/extra/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from 'uilibs/extra/empty'
import { Icon } from 'uilibs/extra/icon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'uilibs/extra/table'
import type { LoanResponse, LoanStatus } from '#/schemas/loans.schema'
import { styles } from '#/styles/pages/dashboard.stylex'

const statusBadge: Record<LoanStatus, Pick<BadgeProps, 'variant' | 'tone'>> = {
  Borrowed: { variant: 'secondary' },
  'Due soon': { variant: 'outline' },
  Overdue: { tone: 'critical' },
  Returned: { variant: 'ghost' }
}

export function LoansTable({ loans }: { loans: LoanResponse[] }) {
  if (loans.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Icon svg={BookOpen} size={16} />
          </EmptyMedia>
          <EmptyTitle>No loans yet</EmptyTitle>
          <EmptyDescription>
            Loans show up here as soon as a member borrows a book from the Hogwarts library.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell>{loan.member}</TableCell>
            <TableCell style={styles.muted}>{loan.book}</TableCell>
            <TableCell style={styles.muted}>{loan.due}</TableCell>
            <TableCell>
              <Badge {...statusBadge[loan.status]}>{loan.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
