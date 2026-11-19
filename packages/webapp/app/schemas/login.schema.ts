import { z } from 'zod'
import { captcha, email } from './fields.schema'

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
  captcha
})
