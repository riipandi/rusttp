import {
  Bell,
  BookOpen,
  ChartColumn,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  Users
} from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, useRouterState } from '@tanstack/react-router'
import * as React from 'react'
import { Avatar, AvatarFallback } from 'uilibs/base/avatar'
import { Button, LinkButton } from 'uilibs/base/button'
import { CloseButton } from 'uilibs/base/dialog/close-button'
import { Separator } from 'uilibs/base/separator'
import { Icon } from 'uilibs/extra/icon'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from 'uilibs/extra/sheet'
import { Logo } from '#/components/logo'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/dashboard.stylex'
import { UserMenu, profile } from './-user-menu'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  /** Without a `to` the entry is a placeholder that does nothing until a route is wired in. */
  to?: '/dashboard' | '/settings/account' | '/settings/security' | '/'
}

// Only Overview has a page; the other sections are placeholders.
const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Loans', icon: BookOpen },
  { label: 'Members', icon: Users },
  { label: 'Reports', icon: ChartColumn }
]

// The account entries below the divider in the sheet. The top bar's account menu is hidden on
// small screens, so the sheet is where the account lives there.
const accountItems: NavItem[] = [
  { label: 'Account', icon: User, to: '/settings/account' },
  { label: 'Security', icon: Shield, to: '/settings/security' },
  { label: 'Sign out', icon: LogOut, to: '/' }
]

function useIsCurrent(to: NavItem['to']) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  // Nested pages keep their section active; /settings/* and the rest do not.
  return to !== undefined && to !== '/' && (pathname === to || pathname.startsWith(`${to}/`))
}

function NavEntry({ label, to }: NavItem) {
  const current = useIsCurrent(to)
  const style = current ? styles.navCurrent : styles.navItem

  if (to) {
    return (
      <LinkButton
        render={<Link to={to} />}
        current={current}
        variant='ghost'
        size='sm'
        style={style}
      >
        {label}
      </LinkButton>
    )
  }

  return (
    <Button variant='ghost' size='sm' style={style}>
      {label}
    </Button>
  )
}

function SheetEntry({
  label,
  icon,
  to,
  secondary,
  onNavigate
}: NavItem & { secondary?: boolean; onNavigate: () => void }) {
  const current = useIsCurrent(to)
  const style = [
    styles.sheetItem,
    secondary && styles.sheetItemSecondary,
    current && styles.navCurrent
  ]
  const content = (
    <>
      <Icon svg={icon} size={secondary ? 16 : 18} />
      {label}
    </>
  )

  if (to) {
    return (
      <LinkButton
        render={<Link to={to} />}
        current={current}
        variant='ghost'
        size='lg'
        style={style}
        onClick={onNavigate}
      >
        {content}
      </LinkButton>
    )
  }

  return (
    <Button variant='ghost' size='lg' style={style}>
      {content}
    </Button>
  )
}

// Below the medium breakpoint the inline nav is hidden and this sheet carries every entry, laid
// out like a mobile app drawer: the account on top, the primary entries, and the quieter account
// entries pinned to the bottom.
function NavSheet() {
  const [open, setOpen] = React.useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant='ghost'
            size='icon-md'
            aria-label='Open navigation'
            style={styles.menuTrigger}
          />
        }
      >
        <Icon svg={Menu} size={20} />
      </SheetTrigger>
      <SheetContent side='left' showCloseButton={false} style={styles.sheetContent}>
        <SheetHeader style={styles.sheetProfile}>
          <div {...stylex.props(styles.sheetProfileTop)}>
            <Avatar size='md'>
              <AvatarFallback>{profile.initials}</AvatarFallback>
            </Avatar>
            <SheetClose render={<CloseButton style={styles.sheetClose} />} />
          </div>
          <SheetTitle style={styles.sheetName}>{profile.name}</SheetTitle>
          <SheetDescription style={styles.sheetEmail}>{profile.email}</SheetDescription>
        </SheetHeader>
        <nav aria-label='Dashboard' {...stylex.props(styles.sheetNav)}>
          {navItems.map((item) => (
            <SheetEntry key={item.label} {...item} onNavigate={close} />
          ))}
        </nav>
        <SheetFooter style={styles.sheetFooter}>
          <Separator style={styles.sheetSeparator} />
          <nav aria-label='Account' {...stylex.props(styles.sheetNav)}>
            {accountItems.map((item) => (
              <SheetEntry key={item.label} {...item} secondary onNavigate={close} />
            ))}
          </nav>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
        <NavSheet />
        <Link to='/' {...stylex.props(layout.brand, styles.brand)}>
          <Logo />
          Rusttp
        </Link>
        <nav aria-label='Dashboard' {...stylex.props(styles.nav)}>
          {navItems.map((item) => (
            <NavEntry key={item.label} {...item} />
          ))}
        </nav>
        <div {...stylex.props(styles.headerEnd)}>
          {/* Placeholder: nothing opens until notifications have a source. */}
          <Button
            variant='ghost'
            size='icon-md'
            aria-label='Notifications'
            style={styles.notifyTrigger}
          >
            <Icon svg={Bell} size={20} />
          </Button>
          <div {...stylex.props(styles.userMenuSlot)}>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
