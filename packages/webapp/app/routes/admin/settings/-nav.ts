import type { LinkProps } from '@tanstack/react-router'
import type { Messages } from '#/libraries/messages'

export interface Page {
  label: string
  to: LinkProps['to']
}

interface PageGroup {
  label?: string
  items: Page[]
}

// The settings sub-navigation, grouped like the admin sidebar: an unlabelled first group, then
// one labelled group per concern. The aside renders the labels as headings, the picker as option
// group labels. Functions, so the labels follow the language the user picked.
export const groups = (m: Messages): PageGroup[] => [
  { items: [{ label: m.settings_nav_general(), to: '/admin/settings/general' }] },
  {
    label: m.settings_nav_group_authentication(),
    items: [
      { label: m.settings_nav_auth(), to: '/admin/settings/auth' },
      { label: m.settings_nav_access(), to: '/admin/settings/access' },
      { label: m.settings_nav_multi_factor(), to: '/admin/settings/multi-factor' },
      { label: m.settings_nav_sessions(), to: '/admin/settings/sessions' }
    ]
  },
  {
    label: m.settings_nav_group_federation(),
    items: [
      { label: m.settings_nav_oidc_settings(), to: '/admin/settings/oidc-settings' },
      { label: m.settings_nav_oidc_clients(), to: '/admin/settings/oidc-clients' },
      { label: m.settings_nav_oauth_providers(), to: '/admin/settings/oauth-providers' }
    ]
  },
  {
    label: m.settings_nav_group_security(),
    items: [
      { label: m.settings_nav_protection(), to: '/admin/settings/protection' },
      { label: m.settings_nav_blocklist(), to: '/admin/settings/blocklist' }
    ]
  },
  {
    label: m.settings_nav_group_system(),
    items: [{ label: m.settings_nav_runtime(), to: '/admin/settings/runtime' }]
  }
]

export const pages = (m: Messages): Page[] => groups(m).flatMap(({ items }) => items)
