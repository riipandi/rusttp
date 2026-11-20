import { BookOpen, ChartColumn, LayoutDashboard, Settings, Users } from '@keyline-icons/react'
import type { NavGroup } from '#/components/nav-sheet'

// Only Overview has a page; the other entries are placeholders until a route is wired in.
export const groups: NavGroup[] = [
  { items: [{ label: 'Overview', icon: LayoutDashboard, to: '/admin', end: true }] },
  {
    label: 'Identity',
    items: [
      { label: 'Users', icon: BookOpen },
      { label: 'Groups', icon: Users },
      { label: 'Roles', icon: ChartColumn }
      // { label: 'Signup tokens', icon: ChartColumn }
      // { label: 'Consents', icon: ChartColumn } // unsure
    ]
  },
  {
    label: 'Security',
    items: [
      { label: 'Audit trail', icon: BookOpen },
      { label: 'Blocklist', icon: Users },
      { label: 'API keys', icon: ChartColumn }
    ]
  },
  {
    label: 'Integrations',
    items: [
      { label: 'OIDC clients', icon: BookOpen },
      { label: 'OAuth providers', icon: BookOpen },
      // { label: 'Custom claims', icon: BookOpen }, // unsure (user claims, group claims)
      { label: 'Webhooks', icon: Users }
    ]
  },
  {
    label: 'Platform',
    items: [
      { label: 'Settings', icon: Settings }, // User & Authentication, Access & Signup, Multi-factor, Sessions, Protection, Federation & OIDC, Runtime
      { label: 'Notifications', icon: BookOpen },
      { label: 'Scheduler', icon: BookOpen } // unsure (Registered queues, pending, dead archive, Registered jobs)
    ]
  }
]
