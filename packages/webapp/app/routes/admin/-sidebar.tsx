import { BookOpen, ChartColumn, LayoutDashboard, Settings, Users } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, useRouterState } from '@tanstack/react-router'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import { Icon } from 'uilibs/extra/icon'
import { Logo } from '#/components/logo'
import { UserMenu } from '#/components/user-menu'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/element/sidebar.stylex'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  /** Only Overview has a page; the other items do nothing until a route is wired in. */
  to?: '/admin'
}

const groups: { label?: string; items: NavItem[] }[] = [
  { items: [{ label: 'Overview', icon: LayoutDashboard, to: '/admin' }] },
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

function NavEntry({ label, icon, to }: NavItem) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  if (to) {
    return (
      <LinkButton
        render={<Link to={to} />}
        current={pathname === to}
        variant='ghost'
        size='sm'
        style={[styles.item, pathname === to ? styles.itemCurrent : styles.itemIdle]}
      >
        <Icon svg={icon} size={16} />
        {label}
      </LinkButton>
    )
  }

  return (
    <Button variant='ghost' size='sm' style={[styles.item, styles.itemIdle]}>
      <Icon svg={icon} size={16} color='neutralFaded' />
      {label}
    </Button>
  )
}

export function Sidebar() {
  const id = React.useId()

  return (
    <aside {...stylex.props(styles.root)}>
      <Link to='/' {...stylex.props(layout.brand, styles.brand)}>
        <Logo />
        Rusttp
      </Link>

      <nav aria-label='Admin' {...stylex.props(styles.nav)}>
        {groups.map(({ label, items }) => (
          <div key={label ?? 'main'} {...stylex.props(styles.group)}>
            {label && (
              <span id={`${id}-${label}`} {...stylex.props(styles.groupLabel)}>
                {label}
              </span>
            )}
            <ul
              aria-labelledby={label ? `${id}-${label}` : undefined}
              {...stylex.props(styles.list)}
            >
              {items.map((item) => (
                <li key={item.label}>
                  <NavEntry {...item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div {...stylex.props(styles.account)}>
        <UserMenu variant='row' />
      </div>
    </aside>
  )
}
