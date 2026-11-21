import {
  BookOpen,
  ChartColumn,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
  Users
} from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import { Button, LinkButton } from 'uilibs/base/button'
import { Logo } from '#/components/logo'
import { type NavGroup, type NavItem, NavSheet, useIsCurrent } from '#/components/nav-sheet'
import { NotificationsPopover } from '#/components/notifications'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import { UserMenu, profile } from './-user-menu'

// Only Overview has a page; the other sections are placeholders.
const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Loans', icon: BookOpen },
  { label: 'Members', icon: Users },
  { label: 'Reports', icon: ChartColumn }
]
const groups: NavGroup[] = [{ items: navItems }]

// The account entries below the divider in the sheet. The top bar's account menu is hidden on
// small screens, so the sheet is where the account lives there.
const accountItems: NavItem[] = [
  { label: 'Account', icon: User, to: '/settings/account' },
  { label: 'Security', icon: Shield, to: '/settings/security' },
  { label: 'Sign out', icon: LogOut, to: '/' }
]

function NavEntry({ item }: { item: NavItem }) {
  const current = useIsCurrent(item)
  const style = current ? styles.navCurrent : styles.navItem

  if (item.to) {
    return (
      <LinkButton
        render={<Link to={item.to} />}
        current={current}
        variant='ghost'
        size='sm'
        style={style}
      >
        {item.label}
      </LinkButton>
    )
  }

  return (
    <Button variant='ghost' size='sm' style={style}>
      {item.label}
    </Button>
  )
}

// Small screens lay the bar out in three zones with the brand centered between the menu trigger
// and the notification trigger (the account menu lives in the sheet there), so the brand sits
// mid-bar; from the medium breakpoint it is the brand and nav on the start side and the
// notification trigger and account menu on the end.
export function DashboardHeader() {
  return (
    <header {...stylex.props(layout.header)}>
      <div {...stylex.props(layout.container, layout.headerRow, styles.headerRow)}>
        <NavSheet
          label='Dashboard'
          profile={profile}
          groups={groups}
          account={accountItems}
          triggerStyle={styles.menuTrigger}
        />
        <Link to='/' {...stylex.props(layout.brand, styles.brand)}>
          <Logo />
          Rusttp
        </Link>
        <nav aria-label='Dashboard' {...stylex.props(styles.nav)}>
          {navItems.map((item) => (
            <NavEntry key={item.label} item={item} />
          ))}
        </nav>
        <div {...stylex.props(styles.headerEnd)}>
          <NotificationsPopover
            to='/notifications'
            trigger={<Button variant='ghost' size='icon-md' style={styles.notifyTrigger} />}
          />
          <div {...stylex.props(styles.userMenuSlot)}>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
