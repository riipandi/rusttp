import * as v from 'valibot'

export const deviceSchema = v.object({
  code: v.pipe(v.string(), v.regex(/^[A-Za-z0-9]{8}$/, 'Enter the 8-character code.'))
})
