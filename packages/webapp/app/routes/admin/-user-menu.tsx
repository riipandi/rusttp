import { AppWindow, ChevronDown, LogOut, Shield, User } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { Link, type LinkProps } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from 'uilibs/base/avatar'
import { Button } from 'uilibs/base/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from 'uilibs/base/dropdown-menu'
import { Icon } from 'uilibs/extra/icon'
import { LanguageMenu } from '#/components/language-menu'
import { ThemeMenu } from '#/components/theme-menu'
import { adminProfile } from '#/fixtures/profile'
import { m } from '#/paraglide/messages'
import { styles } from '#/styles/element/user-menu.stylex'

interface UserMenuItem {
  label: string
  icon: typeof User
  to: LinkProps['to']
}

// Personal entries only: the instance's own settings and API keys live in the sidebar. The command
// bar lists the same entries (`-commandbar.tsx`), so a link added here is searchable there.
export const accountItems = () =>
  [
    { label: m.user_menu_account(), icon: User, to: '/admin/account' },
    { label: m.user_menu_security(), icon: Shield, to: '/admin/security' }
  ] satisfies UserMenuItem[]

export const appItems = () =>
  [{ label: m.user_menu_back_to_app(), icon: AppWindow, to: '/dashboard' }] satisfies UserMenuItem[]

/** Where Sign out leads, until there is a session to end. */
export const signOutTo = '/'

/**
 * The admin sidebar's account trigger: the bare avatar, with the notification bell beside it in
 * the strip (`routes/admin/-sidebar.tsx`). The name, role, and email are in the menu, which opens
 * above the avatar, or beside the rail when collapsed. `mobile` is the drawer's: the trigger adds a
 * short name, and the menu's rows and text are sized for a finger.
 */
export function AdminUserMenu({
  collapsed = false,
  mobile = false
}: {
  collapsed?: boolean
  mobile?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size={mobile ? 'lg' : 'icon-md'}
            aria-label={m.user_menu_trigger_named({ name: adminProfile.name })}
            style={[mobile ? styles.pill : styles.bare, stylex.defaultMarker()]}
          />
        }
      >
        <Avatar size='sm' style={styles.avatar}>
          <AvatarFallback style={styles.triggerInitials}>{adminProfile.initials}</AvatarFallback>
        </Avatar>
        {mobile && (
          <>
            <span {...stylex.props(styles.pillName)}>{adminProfile.firstName}</span>
            <span {...stylex.props(styles.pillChevron)}>
              <Icon svg={ChevronDown} size={14} color='neutralFaded' />
            </span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? 'right' : 'top'}
        align={collapsed ? 'end' : 'start'}
        // 8px past the divider the avatar sits under: the strip's top edge (or the rail's right edge)
        // is 16px from the avatar, the drawer's separator 12px from its trigger. Expanded, 4px back
        // lines the menu up with the nav items' left edge.
        sideOffset={mobile ? 20 : 24}
        alignOffset={collapsed || mobile ? 0 : -4}
        style={styles.menu}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel style={[styles.menuLabel, mobile && styles.menuLabelTouch]}>
            <span {...stylex.props(styles.menuName, styles.menuTextWrap)}>{adminProfile.name}</span>
            <span
              {...stylex.props(
                styles.menuEmail,
                styles.menuTextWrap,
                mobile && styles.menuEmailSmall
              )}
            >
              {adminProfile.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {accountItems().map(({ label, icon, to }) => (
            <DropdownMenuItem
              key={label}
              render={<Link to={to} />}
              style={mobile ? styles.menuItemTouch : undefined}
            >
              <Icon svg={icon} size={16} color='neutralFaded' />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {appItems().map(({ label, icon, to }) => (
            <DropdownMenuItem
              key={label}
              render={<Link to={to} />}
              style={mobile ? styles.menuItemTouch : undefined}
            >
              <Icon svg={icon} size={16} color='neutralFaded' />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ThemeMenu style={mobile ? styles.menuItemTouch : undefined} />
        <LanguageMenu style={mobile ? styles.menuItemTouch : undefined} />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link to={signOutTo} />}
          style={mobile ? styles.menuItemTouch : undefined}
        >
          <Icon svg={LogOut} size={16} color='neutralFaded' />
          {m.user_menu_sign_out()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
