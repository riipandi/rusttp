import * as v from 'valibot'
import { email } from './fields.schema'

export const forgotPasswordSchema = v.object({ email })
