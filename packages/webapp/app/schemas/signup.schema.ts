import { z } from 'zod'
import { captcha, email, newPassword } from './fields.schema'

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  email,
  password: newPassword,
  captcha
})
