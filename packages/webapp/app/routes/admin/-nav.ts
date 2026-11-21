import { History, IdCard, Key, LayoutDashboard } from '@keyline-icons/react'
import { Layers, Megaphone } from '@keyline-icons/react'
import { Settings, Timer, Users, Webhook } from '@keyline-icons/react'
import type { NavGroup } from '#/components/nav-sheet'
import { m } from '#/paraglide/messages'

// A function, not a constant: the labels are messages, read when the layout renders, so they follow
// the language the user picked.
// Only Overview has a page; the other entries are placeholders until a route is wired in.
export const groups = (): NavGroup[] => [
  {
    items: [
      { label: m.admin_nav_overview(), icon: LayoutDashboard, to: '/admin', end: true },
      { label: m.admin_nav_audit_trail(), icon: History, to: '/admin/audit-trail' }
    ]
  },
  {
    label: m.admin_nav_group_identity(),
    items: [
      { label: m.admin_nav_users(), icon: Users, to: '/admin/users' },
      { label: m.admin_nav_user_groups(), icon: Layers, to: '/admin/user-groups' },
      { label: m.admin_nav_roles(), icon: IdCard, to: '/admin/roles' },
      { label: m.admin_nav_api_keys(), icon: Key, to: '/admin/api-keys' }
      // { label: 'Signup tokens', icon: ChartColumn }
      // { label: 'Consents', icon: ChartColumn } // unsure
      // { label: 'Custom claims', icon: BookOpen }, // unsure (user claims, group claims)
    ]
  },
  {
    label: m.admin_nav_group_system(),
    items: [
      { label: m.admin_nav_messages(), icon: Megaphone, to: '/admin/messages' },
      { label: m.admin_nav_webhooks(), icon: Webhook, to: '/admin/webhooks' },
      { label: m.admin_nav_scheduler(), icon: Timer, to: '/admin/scheduler' }, // unsure (Registered queues, pending, dead archive, Registered jobs)
      { label: m.admin_nav_settings(), icon: Settings, to: '/admin/settings' }
    ]
  }
]
