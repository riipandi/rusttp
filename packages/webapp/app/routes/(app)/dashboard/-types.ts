export type LoanStatus = 'Borrowed' | 'Due soon' | 'Overdue' | 'Returned'

export interface Loan {
  id: string
  member: string
  book: string
  due: string
  status: LoanStatus
}

export interface SummaryItem {
  label: string
  value: string
}
