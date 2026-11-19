import * as v from 'valibot'
import { captcha, email, newPassword } from './fields.schema'

export const signupSchema = v.object({
  firstName: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter your first name.')),
  lastName: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter your last name.')),
  email,
  password: newPassword,
  captcha
})
