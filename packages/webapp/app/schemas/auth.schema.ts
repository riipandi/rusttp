import * as v from 'valibot'

// What the sign-in and account-recovery forms send. `<Name>Schema` is the Valibot schema that holds
// the rules, `<Name>Request` the type it gives the form; messages are written for the person
// filling the form in.

// The rules several forms share.
export const emailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('Enter your email address.'),
  v.email('Enter a valid email address.')
)

// New passwords only; signing in accepts whatever was set before the rule existed.
export const newPasswordSchema = v.pipe(
  v.string(),
  v.nonEmpty('Enter a password.'),
  v.minLength(12, 'Use at least 12 characters.')
)

// A checkbox is a boolean; the captcha has to be checked.
export const captchaSchema = v.pipe(
  v.boolean(),
  v.check((checked) => checked, 'Confirm that you are not a robot.')
)

// A link that carries a token in its query string (reset, device): without one it is not that link.
export const tokenSchema = v.pipe(v.string(), v.nonEmpty())

export const loginSchema = v.object({
  email: emailSchema,
  password: v.pipe(v.string(), v.nonEmpty('Enter your password.')),
  captcha: captchaSchema
})
export type LoginRequest = v.InferOutput<typeof loginSchema>

export const signupSchema = v.object({
  firstName: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter your first name.')),
  lastName: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter your last name.')),
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
export type ResetPasswordRequest = v.InferOutput<typeof resetPasswordSchema>

export const resetSearchSchema = v.object({ token: tokenSchema })

export const twoFactorSchema = v.object({
  code: v.pipe(v.string(), v.regex(/^\d{6}$/, 'Enter the 6-digit code.')),
  trust: v.boolean()
})
export type TwoFactorRequest = v.InferOutput<typeof twoFactorSchema>

export const deviceSchema = v.object({
  token: tokenSchema,
  code: v.pipe(v.string(), v.regex(/^[A-Z0-9]{8}$/, 'Enter the 8-character code.'))
})
export type DeviceRequest = v.InferOutput<typeof deviceSchema>

export const deviceSearchSchema = v.object({ token: tokenSchema })
