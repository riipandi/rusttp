import * as stylex from '@stylexjs/stylex'
import { Button } from 'uilibs/base/button'
import { Logo } from '#/components/logo'
import { NavSheet } from '#/components/nav-sheet'
import { NotificationsPopover } from '#/components/notifications'
import { useMessages } from '#/libraries/messages'
import { styles as layout } from '#/styles/element/layout.stylex'
import { styles } from '#/styles/pages/admin.stylex'
import { groups } from './-nav'
import { AdminUserMenu } from './-user-menu'

// The small-screen counterpart of the sidebar: it only shows below the compact breakpoint. The
// drawer carries the sidebar's own account menu at its bottom.
export function AdminTopBar() {
  const m = useMessages()
  return (
    <header {...stylex.props(styles.topbar)}>
      <NavSheet
        label={m.admin_nav_landmark()}
        brand={
          <>
            <Logo />
            Rusttp
          </>
        }
        groups={groups(m)}
        footer={<AdminUserMenu mobile />}
        dense
      />
      {/* Not a link: the drawer's Overview item leads to `/admin`. */}
      <span {...stylex.props(layout.brand, styles.brand)}>
        <Logo />
        Rusttp
      </span>
      <NotificationsPopover
        to='/admin/notifications'
        trigger={<Button variant='ghost' size='icon-md' style={styles.notify} />}
      />
    </header>
  )
}
