import * as v from 'valibot'

// The customer dashboard's bodies, as the API will return them (see `identity.schema.ts`).

export const loanStatusSchema = v.picklist(['Borrowed', 'Due soon', 'Overdue', 'Returned'])
export type LoanStatus = v.InferOutput<typeof loanStatusSchema>

export const loanSchema = v.object({
  id: v.string(),
  member: v.string(),
  book: v.string(),
  due: v.string(),
  status: loanStatusSchema
})
export type LoanResponse = v.InferOutput<typeof loanSchema>

export const summaryIdSchema = v.picklist([
  'active-loans',
  'overdue',
  'new-members',
  'books-available'
])
export const summaryItemSchema = v.object({ id: summaryIdSchema, value: v.string() })
export type SummaryItemResponse = v.InferOutput<typeof summaryItemSchema>
