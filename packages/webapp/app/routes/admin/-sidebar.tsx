import { BookOpen, ChartColumn, LayoutDashboard, Settings, Users } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import { Button, LinkButton } from 'uilibs/base/button'
import { Icon } from 'uilibs/extra/icon'
import { Logo } from '#/components/logo'
import { UserMenu } from '#/components/user-menu'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/element/sidebar.stylex'

// Placeholders: only Overview has a page, the other items do nothing until a route is wired in.
const items = [
  { label: 'Loans', icon: BookOpen },
  { label: 'Members', icon: Users },
  { label: 'Reports', icon: ChartColumn },
  { label: 'Settings', icon: Settings }
]

export function Sidebar() {
  return (
    <aside {...stylex.props(styles.root)}>
      <Link to='/' {...stylex.props(layout.brand, styles.brand)}>
        <Logo />
        Rusttp
      </Link>

      <nav aria-label='Admin' {...stylex.props(styles.nav)}>
        <ul {...stylex.props(styles.list)}>
          <li>
            <LinkButton
              render={<Link to='/admin' />}
              current
              variant='ghost'
              size='sm'
              style={[styles.item, styles.itemCurrent]}
            >
              <Icon svg={LayoutDashboard} size={16} />
              Overview
            </LinkButton>
          </li>
          {items.map(({ label, icon }) => (
            <li key={label}>
              <Button variant='ghost' size='sm' style={[styles.item, styles.itemIdle]}>
                <Icon svg={icon} size={16} color='neutralFaded' />
                {label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div {...stylex.props(styles.account)}>
        <UserMenu />
        <div {...stylex.props(styles.identity)}>
          <span {...stylex.props(styles.name)}>Hermione Granger</span>
          <span {...stylex.props(styles.email)}>hermione.granger@example.com</span>
        </div>
      </div>
    </aside>
  )
}
