import { z } from 'zod'

// The rules several forms share. Messages are written for the person filling the form in.

export const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .pipe(z.email('Enter a valid email address.'))

// New passwords only; signing in accepts whatever was set before the rule existed.
export const newPassword = z
  .string()
  .min(1, 'Enter a password.')
  .min(12, 'Use at least 12 characters.')

// A checkbox is a boolean; the captcha has to be checked.
export const captcha = z.boolean().refine((checked) => checked, 'Confirm that you are not a robot.')
