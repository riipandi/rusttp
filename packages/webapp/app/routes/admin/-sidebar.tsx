import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import * as React from 'react'
import { Button, LinkButton } from 'uilibs/base/button'
import { Icon } from 'uilibs/extra/icon'
import { Logo } from '#/components/logo'
import { type NavItem, useIsCurrent } from '#/components/nav-sheet'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/element/sidebar.stylex'
import { groups } from './-nav'
import { AdminUserMenu } from './-user-menu'

function NavEntry({ item }: { item: NavItem }) {
  const current = useIsCurrent(item)
  const { label, icon, to } = item

  if (to) {
    return (
      <LinkButton
        render={<Link to={to} />}
        current={current}
        variant='ghost'
        size='sm'
        style={[styles.item, current ? styles.itemCurrent : styles.itemIdle]}
      >
        <Icon svg={icon} size={16} />
        {label}
      </LinkButton>
    )
  }

  return (
    <Button variant='ghost' size='sm' aria-disabled style={[styles.item, styles.itemIdle]}>
      <Icon svg={icon} size={16} color='neutralFaded' />
      {label}
    </Button>
  )
}

export function Sidebar() {
  const id = React.useId()

  return (
    <aside {...stylex.props(styles.root)}>
      <Link to='/admin' {...stylex.props(layout.brand, styles.brand)}>
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
                  <NavEntry item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div {...stylex.props(styles.account)}>
        <AdminUserMenu />
      </div>
    </aside>
  )
}
