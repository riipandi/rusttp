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
import { type NavItem, NavSheet, useIsCurrent } from '#/components/nav-sheet'
import { NotificationsPopover } from '#/components/notifications'
import { profile } from '#/fixtures/profile'
import { m } from '#/paraglide/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import { UserMenu } from './-user-menu'

// Only Overview has a page; the other sections are placeholders.
const navItems = (): NavItem[] => [
  { label: m.app_nav_overview(), icon: LayoutDashboard, to: '/dashboard' },
  { label: m.app_nav_loans(), icon: BookOpen },
  { label: m.app_nav_members(), icon: Users },
  { label: m.app_nav_reports(), icon: ChartColumn }
]

// The account entries below the divider in the sheet. The top bar's account menu is hidden on
// small screens, so the sheet is where the account lives there.
const accountItems = (): NavItem[] => [
  { label: m.user_menu_account(), icon: User, to: '/settings/account' },
  { label: m.user_menu_security(), icon: Shield, to: '/settings/security' },
  { label: m.user_menu_sign_out(), icon: LogOut, to: '/' }
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
  const items = navItems()
  return (
    <header {...stylex.props(layout.header)}>
      <div {...stylex.props(layout.container, layout.headerRow, styles.headerRow)}>
        <NavSheet
          label={m.app_nav_landmark()}
          profile={profile}
          groups={[{ items }]}
          account={accountItems()}
          triggerStyle={styles.menuTrigger}
        />
        <Link to='/' {...stylex.props(layout.brand, styles.brand)}>
          <Logo />
          Rusttp
        </Link>
        <nav aria-label={m.app_nav_landmark()} {...stylex.props(styles.nav)}>
          {items.map((item) => (
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
