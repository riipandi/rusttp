import * as v from 'valibot'

// The customer dashboard's bodies, as the API will return them (see `identity.schema.ts`).

export const loanStatusSchema = v.picklist(['Borrowed', 'Due soon', 'Overdue', 'Returned'])
export type LoanStatus = v.InferOutput<typeof loanStatusSchema>

export const loanSchema = v.object({
  id: v.string(),
  member: v.string(),
  book: v.string(),
  /** The day the loan is due, an ISO date (`2026-11-28`). */
  due: v.pipe(v.string(), v.isoDate()),
  status: loanStatusSchema
})
export type LoanResponse = v.InferOutput<typeof loanSchema>

export const summaryIdSchema = v.picklist([
  'active-loans',
  'overdue',
  'new-members',
  'books-available'
])
export const summaryItemSchema = v.object({ id: summaryIdSchema, value: v.number() })
export type SummaryItemResponse = v.InferOutput<typeof summaryItemSchema>
