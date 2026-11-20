import type { LinkProps } from '@tanstack/react-router'

export const pages = [
  { label: 'General', to: '/admin/settings/general' },
  { label: 'User & authentication', to: '/admin/settings/auth' },
  { label: 'Access & signup', to: '/admin/settings/access' },
  { label: 'Multi-factor', to: '/admin/settings/multi-factor' },
  { label: 'Sessions', to: '/admin/settings/sessions' },
  { label: 'Protection', to: '/admin/settings/protection' },
  { label: 'Federation & OIDC', to: '/admin/settings/oidc' },
  { label: 'Runtime', to: '/admin/settings/runtime' }
] as const satisfies readonly { label: string; to: LinkProps['to'] }[]
