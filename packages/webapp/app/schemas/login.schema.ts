import * as v from 'valibot'
import { captcha, email } from './fields.schema'

export const loginSchema = v.object({
  email,
  password: v.pipe(v.string(), v.nonEmpty('Enter your password.')),
  captcha
})
