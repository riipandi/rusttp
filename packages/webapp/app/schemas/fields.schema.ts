import * as v from 'valibot'

// The rules several forms share. Messages are written for the person filling the form in.

export const email = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('Enter your email address.'),
  v.email('Enter a valid email address.')
)

// New passwords only; signing in accepts whatever was set before the rule existed.
export const newPassword = v.pipe(
  v.string(),
  v.nonEmpty('Enter a password.'),
  v.minLength(12, 'Use at least 12 characters.')
)

// A checkbox is a boolean; the captcha has to be checked.
export const captcha = v.pipe(
  v.boolean(),
  v.check((checked) => checked, 'Confirm that you are not a robot.')
)
