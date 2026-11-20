import * as v from 'valibot'
import { newPassword } from './fields.schema'

export const resetPasswordSchema = v.pipe(
  v.object({
    token: v.pipe(v.string(), v.nonEmpty()),
    password: newPassword,
    confirm: v.pipe(v.string(), v.nonEmpty('Confirm your new password.'))
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirm']],
      (input) => input.password === input.confirm,
      'The passwords do not match.'
    ),
    ['confirm']
  )
)

// The reset link carries its token in the query string; a link without one is not a reset link.
export const resetSearchSchema = v.object({ token: v.pipe(v.string(), v.nonEmpty()) })
