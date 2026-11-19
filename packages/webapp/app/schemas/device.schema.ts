import { z } from 'zod'

export const deviceSchema = z.object({
  code: z.string().regex(/^[A-Za-z0-9]{8}$/, 'Enter the 8-character code.')
})
