export const routes = {
  home: '/',
  dashboard: '/dashboard',
  admin: '/admin',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password?token=alohomora',
  resetPasswordWithoutToken: '/reset-password',
  verifyEmail: '/verify-email',
  emailVerified: '/email-verified',
  mfa: '/mfa',
  device: '/device',
  missing: '/this-page-does-not-exist'
} as const
