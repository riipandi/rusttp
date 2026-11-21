import * as v from 'valibot'
import { m } from '#/paraglide/messages'

// What the sign-in and account-recovery forms send. `<Name>Schema` is the Valibot schema that holds
// the rules, `<Name>Request` the type it gives the form; messages are written for the person
// filling the form in. Each message is a function, so Valibot reads it when a rule fails, in the
// language shown at that moment.

// The rules several forms share.
export const emailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty(() => m.validation_email_required()),
  v.email(() => m.validation_email_invalid())
)

// New passwords only; signing in accepts whatever was set before the rule existed.
export const newPasswordSchema = v.pipe(
  v.string(),
  v.nonEmpty(() => m.validation_password_required()),
  v.minLength(12, () => m.validation_password_too_short())
)

// A checkbox is a boolean; the captcha has to be checked.
export const captchaSchema = v.pipe(
  v.boolean(),
  v.check(
    (checked) => checked,
    () => m.validation_captcha_required()
  )
)

// A link that carries a token in its query string (reset, device): without one it is not that link.
export const tokenSchema = v.pipe(v.string(), v.nonEmpty())

export const loginSchema = v.object({
  email: emailSchema,
  password: v.pipe(
    v.string(),
    v.nonEmpty(() => m.validation_login_password_required())
  ),
  captcha: captchaSchema
})
export type LoginRequest = v.InferOutput<typeof loginSchema>

export const signupSchema = v.object({
  firstName: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(() => m.validation_first_name_required())
  ),
  lastName: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(() => m.validation_last_name_required())
  ),
  email: emailSchema,
  password: newPasswordSchema,
  captcha: captchaSchema
})
export type SignupRequest = v.InferOutput<typeof signupSchema>

export const forgotPasswordSchema = v.object({ email: emailSchema })
export type ForgotPasswordRequest = v.InferOutput<typeof forgotPasswordSchema>

export const resetPasswordSchema = v.pipe(
  v.object({
    token: tokenSchema,
    password: newPasswordSchema,
    confirm: v.pipe(
      v.string(),
      v.nonEmpty(() => m.validation_confirm_required())
    )
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirm']],
      (input) => input.password === input.confirm,
      () => m.validation_passwords_mismatch()
    ),
    ['confirm']
  )
)
export type ResetPasswordRequest = v.InferOutput<typeof resetPasswordSchema>

export const resetSearchSchema = v.object({ token: tokenSchema })

export const twoFactorSchema = v.object({
  code: v.pipe(
    v.string(),
    v.regex(/^\d{6}$/, () => m.validation_two_factor_code_invalid())
  ),
  trust: v.boolean()
})
export type TwoFactorRequest = v.InferOutput<typeof twoFactorSchema>

export const deviceSchema = v.object({
  token: tokenSchema,
  code: v.pipe(
    v.string(),
    v.regex(/^[A-Z0-9]{8}$/, () => m.validation_device_code_invalid())
  )
})
export type DeviceRequest = v.InferOutput<typeof deviceSchema>

export const deviceSearchSchema = v.object({ token: tokenSchema })
