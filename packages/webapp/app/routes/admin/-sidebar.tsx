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
      <Link to='/' {...stylex.props(layout.brand)}>
        <Logo />
        Rusttp
      </Link>
      <nav aria-label='Admin' {...stylex.props(styles.nav)}>
        <LinkButton
          render={<Link to='/admin' />}
          current
          variant='ghost'
          size='md'
          style={[styles.item, styles.itemCurrent]}
        >
          <Icon svg={LayoutDashboard} size={16} />
          Overview
        </LinkButton>
        {items.map(({ label, icon }) => (
          <Button key={label} variant='ghost' size='md' style={[styles.item, styles.itemIdle]}>
            <Icon svg={icon} size={16} color='neutralFaded' />
            {label}
          </Button>
        ))}
      </nav>
      <div {...stylex.props(styles.footer)}>
        <UserMenu />
      </div>
    </aside>
  )
}
