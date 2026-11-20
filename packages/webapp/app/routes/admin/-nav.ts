import { BookOpen, ChartColumn, LayoutDashboard, Settings, Users } from '@keyline-icons/react'
import type { NavGroup } from '#/components/nav-sheet'

// Only Overview has a page; the other entries are placeholders until a route is wired in.
export const groups: NavGroup[] = [
  { items: [{ label: 'Overview', icon: LayoutDashboard, to: '/admin', end: true }] },
  {
    label: 'Library',
    items: [
      { label: 'Loans', icon: BookOpen },
      { label: 'Members', icon: Users },
      { label: 'Reports', icon: ChartColumn }
    ]
  },
  { label: 'System', items: [{ label: 'Settings', icon: Settings }] }
]
