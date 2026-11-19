import { z } from 'zod'
import { email } from './fields.schema'

export const forgotPasswordSchema = z.object({ email })
