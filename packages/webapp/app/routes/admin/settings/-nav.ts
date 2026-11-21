import type { LinkProps } from '@tanstack/react-router'

interface Page {
  label: string
  to: LinkProps['to']
}

interface PageGroup {
  label?: string
  items: Page[]
}

// The settings sub-navigation, grouped like the admin sidebar: an unlabelled first group, then
// one labelled group per concern. The aside renders the labels as headings, the picker as option
// group labels.
export const groups: PageGroup[] = [
  { items: [{ label: 'General', to: '/admin/settings/general' }] },
  {
    label: 'Authentication',
    items: [
      { label: 'User & authentication', to: '/admin/settings/auth' },
      { label: 'Access & signup', to: '/admin/settings/access' },
      { label: 'Multi-factor', to: '/admin/settings/multi-factor' },
      { label: 'Sessions', to: '/admin/settings/sessions' }
    ]
  },
  {
    label: 'Federation',
    items: [
      { label: 'OIDC settings', to: '/admin/settings/oidc-settings' },
      { label: 'OIDC clients', to: '/admin/settings/oidc-clients' },
      { label: 'OAuth providers', to: '/admin/settings/oauth-providers' }
    ]
  },
  {
    label: 'Security',
    items: [
      { label: 'Protection', to: '/admin/settings/protection' },
      { label: 'Blocklist', to: '/admin/settings/blocklist' }
    ]
  },
  { label: 'System', items: [{ label: 'Runtime', to: '/admin/settings/runtime' }] }
]

export const pages = groups.flatMap(({ items }) => items)
