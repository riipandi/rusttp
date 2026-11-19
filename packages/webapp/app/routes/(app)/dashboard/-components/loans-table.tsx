import { Badge, type BadgeVariant } from 'uilibs/extra/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'uilibs/extra/table'
import { styles } from '#/styles/pages/dashboard.stylex'
import { loans, type LoanStatus } from '../-data'

const statusVariant: Record<LoanStatus, BadgeVariant> = {
  Borrowed: 'secondary',
  'Due soon': 'outline',
  Overdue: 'destructive',
  Returned: 'ghost'
}

export function LoansTable() {
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
              <Badge variant={statusVariant[loan.status]}>{loan.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
