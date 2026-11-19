export type LoanStatus = 'Borrowed' | 'Due soon' | 'Overdue' | 'Returned'

export interface Loan {
  id: string
  member: string
  book: string
  due: string
  status: LoanStatus
}

export const summary = [
  { label: 'Active loans', value: '128' },
  { label: 'Overdue', value: '7' },
  { label: 'New members this week', value: '12' }
]

export const loans: Loan[] = [
  {
    id: 'loan-1',
    member: 'Hermione Granger',
    book: 'Hogwarts: A History',
    due: 'Nov 28',
    status: 'Borrowed'
  },
  {
    id: 'loan-2',
    member: 'Robert Langdon',
    book: 'The Lost Symbol',
    due: 'Nov 23',
    status: 'Due soon'
  },
  {
    id: 'loan-3',
    member: 'Harry Potter',
    book: 'Quidditch Through the Ages',
    due: 'Nov 12',
    status: 'Overdue'
  },
  {
    id: 'loan-4',
    member: 'Sophie Neveu',
    book: 'The Da Vinci Code',
    due: 'Nov 30',
    status: 'Borrowed'
  },
  {
    id: 'loan-5',
    member: 'Minerva McGonagall',
    book: 'Fantastic Beasts and Where to Find Them',
    due: 'Nov 9',
    status: 'Returned'
  },
  {
    id: 'loan-6',
    member: 'Katherine Solomon',
    book: 'Angels & Demons',
    due: 'Nov 25',
    status: 'Due soon'
  }
]
