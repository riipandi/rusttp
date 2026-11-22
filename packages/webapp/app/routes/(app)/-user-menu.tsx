import { LogOut, Shield, User } from '@keyline-icons/react'
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
import { profile } from '#/fixtures/profile'
import { type Messages, useMessages } from '#/libraries/messages'
import { styles } from '#/styles/element/user-menu.stylex'

interface UserMenuItem {
  label: string
  icon: typeof User
  to?: LinkProps['to']
}

// An item with a `to` navigates; the rest are placeholders until a route is wired in.
const accountItems = (m: Messages) =>
  [
    { label: m.user_menu_account(), icon: User, to: '/settings/account' },
    { label: m.user_menu_security(), icon: Shield, to: '/settings/security' }
  ] satisfies UserMenuItem[]

// The customer dashboard's account menu: the avatar alone, in the top bar.
export function UserMenu() {
  const m = useMessages()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon-md'
            aria-label={m.user_menu_trigger_initials({ initials: profile.initials })}
            style={styles.trigger}
          />
        }
      >
        <Avatar size='sm'>
          <AvatarFallback style={styles.triggerInitials}>{profile.initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='end' sideOffset={8} style={styles.menu}>
        <DropdownMenuGroup>
          <DropdownMenuLabel style={styles.menuLabel}>
            <span {...stylex.props(styles.menuName)} title={profile.name}>
              {profile.name}
            </span>
            <span {...stylex.props(styles.menuEmail)} title={profile.email}>
              {profile.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {accountItems(m).map((item) => (
            <DropdownMenuItem key={item.label} render={<Link to={item.to} />}>
              <Icon svg={item.icon} size={16} color='neutral-faded' />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ThemeMenu />
        <LanguageMenu />
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to='/' />}>
          <Icon svg={LogOut} size={16} color='neutral-faded' />
          {m.user_menu_sign_out()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
