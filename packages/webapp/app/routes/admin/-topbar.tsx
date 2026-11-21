import { Bell } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Button } from 'uilibs/base/button'
import { Icon } from 'uilibs/extra/icon'
import { Logo } from '#/components/logo'
import { NavSheet } from '#/components/nav-sheet'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/admin.stylex'
import { groups } from './-nav'
import { AdminUserMenu } from './-user-menu'

// The small-screen counterpart of the sidebar: it only shows below the compact breakpoint. The
// drawer carries the sidebar's own account menu at its bottom.
export function AdminTopBar() {
  return (
    <header {...stylex.props(styles.topbar)}>
      <NavSheet
        label='Admin'
        brand={
          <>
            <Logo />
            Rusttp
          </>
        }
        groups={groups}
        footer={<AdminUserMenu mobile />}
        dense
      />
      {/* Not a link: the drawer's Overview item leads to `/admin`. */}
      <span {...stylex.props(layout.brand, styles.brand)}>
        <Logo />
        Rusttp
      </span>
      {/* Placeholder: nothing opens until notifications have a source. */}
      <Button variant='ghost' size='icon-md' aria-label='Notifications' style={styles.notify}>
        <Icon svg={Bell} size={20} />
      </Button>
    </header>
  )
}
