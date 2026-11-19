import * as v from 'valibot'

export const mfaSchema = v.object({
  code: v.pipe(v.string(), v.regex(/^\d{6}$/, 'Enter the 6-digit code.')),
  trust: v.boolean()
})
