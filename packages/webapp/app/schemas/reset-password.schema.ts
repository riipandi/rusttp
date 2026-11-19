import { z } from 'zod'
import { newPassword } from './fields.schema'

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: newPassword,
    confirm: z.string().min(1, 'Confirm your new password.')
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    error: 'The passwords do not match.'
  })

// The reset link carries its token in the query string; a link without one is not a reset link.
export const resetSearchSchema = z.object({ token: z.string().min(1) })
