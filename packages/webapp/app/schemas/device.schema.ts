import * as v from 'valibot'

export const deviceSchema = v.object({
  token: v.pipe(v.string(), v.nonEmpty()),
  code: v.pipe(v.string(), v.regex(/^[A-Z0-9]{8}$/, 'Enter the 8-character code.'))
})

// The device link carries its token in the query string; a link without one is not a device link.
export const deviceSearchSchema = v.object({ token: v.pipe(v.string(), v.nonEmpty()) })
