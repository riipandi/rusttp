import { Ban, History, ShieldCheck, Key, LayoutDashboard } from '@keyline-icons/react'
import { Layers, LogIn, Megaphone, Plug } from '@keyline-icons/react'
import { Settings, Timer, Users, Webhook } from '@keyline-icons/react'
import type { NavGroup } from '#/components/nav-sheet'

// Only Overview has a page; the other entries are placeholders until a route is wired in.
export const groups: NavGroup[] = [
  {
    items: [
      { label: 'Overview', icon: LayoutDashboard, to: '/admin', end: true },
      { label: 'Audit trail', icon: History, to: '/admin/audit-trail' }
    ]
  },
  {
    label: 'Identity',
    items: [
      { label: 'Users', icon: Users, to: '/admin/users' },
      { label: 'Groups', icon: Layers, to: '/admin/user-groups' },
      { label: 'Authorization', icon: ShieldCheck, to: '/admin/authorization' },
      { label: 'OIDC clients', icon: Plug, to: '/admin/oidc-clients' },
      { label: 'API keys', icon: Key, to: '/admin/api-keys' }
      // { label: 'Signup tokens', icon: ChartColumn }
      // { label: 'Consents', icon: ChartColumn } // unsure
      // { label: 'Custom claims', icon: BookOpen }, // unsure (user claims, group claims)
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Blocklist', icon: Ban, to: '/admin/blocklist' },
      { label: 'Messages', icon: Megaphone, to: '/admin/messages' },
      { label: 'OAuth providers', icon: LogIn, to: '/admin/oauth-providers' },
      { label: 'Webhooks', icon: Webhook, to: '/admin/webhooks' },
      { label: 'Scheduler', icon: Timer, to: '/admin/scheduler' }, // unsure (Registered queues, pending, dead archive, Registered jobs)
      { label: 'Settings', icon: Settings, to: '/admin/settings' } // User & Authentication, Access & Signup, Multi-factor, Sessions, Protection, Federation & OIDC, Runtime
    ]
  }
]
