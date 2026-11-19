import { z } from 'zod'

export const mfaSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
  trust: z.boolean()
})
