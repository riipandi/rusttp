import {
  ChevronsUpDown,
  Key,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User
} from '@keyline-icons/react'
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from 'uilibs/base/dropdown-menu'
import { Icon } from 'uilibs/extra/icon'
import { useTheme } from 'uilibs/theme'
import { styles } from '#/styles/element/user-menu.stylex'

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

interface UserMenuItem {
  label: string
  icon: typeof User
  to?: LinkProps['to']
}

const accountItems = [
  { label: 'Account', icon: User, to: '/admin/account' },
  { label: 'Settings', icon: Settings },
  { label: 'API keys', icon: Key }
] satisfies UserMenuItem[]

const profile = {
  name: 'Hermione Granger',
  email: 'hermione.granger@example.com',
  role: 'Administrator',
  initials: 'HG'
}

/**
 * The admin sidebar's account row: avatar, name, and role as one target, opening upward from its
 * start edge. The email stays in the menu: it is too long for a sidebar row. Collapsed, the row is
 * the bare avatar and the menu opens beside the rail, as wide as a menu is by default. `mobile` is
 * the drawer's: the menu keeps its own width rather than the row's (a drawer-wide menu dwarfs its
 * few items), and its rows and text are sized for a finger.
 */
export function AdminUserMenu({
  collapsed = false,
  mobile = false
}: {
  collapsed?: boolean
  mobile?: boolean
}) {
  const { theme = 'system', setTheme } = useTheme()
  const current = themes.find((item) => item.value === theme) ?? themes[2]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='lg'
            aria-label={collapsed ? `${profile.name}, account menu` : undefined}
            style={[styles.row, collapsed && styles.rowCollapsed]}
          />
        }
      >
        <Avatar size='sm'>
          <AvatarFallback style={styles.triggerInitials}>{profile.initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <span {...stylex.props(styles.rowIdentity)}>
              <span {...stylex.props(styles.menuName)} title={profile.name}>
                {profile.name}
              </span>
              <span {...stylex.props(styles.menuEmail)}>{profile.role}</span>
            </span>
            <span {...stylex.props(styles.rowChevron)}>
              <Icon svg={ChevronsUpDown} size={16} color='neutralFaded' />
            </span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? 'right' : 'top'}
        align={collapsed ? 'end' : 'start'}
        sideOffset={8}
        style={collapsed || mobile ? styles.menu : [styles.menu, styles.menuRow]}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel style={[styles.menuLabel, mobile && styles.menuLabelTouch]}>
            <span {...stylex.props(styles.menuName)} title={profile.name}>
              {profile.name}
            </span>
            <span
              {...stylex.props(styles.menuEmail, mobile && styles.menuEmailSmall)}
              title={profile.email}
            >
              {profile.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {accountItems.map(({ label, icon }) => (
            <DropdownMenuItem key={label} style={mobile ? styles.menuItemTouch : undefined}>
              <Icon svg={icon} size={16} color='neutralFaded' />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger style={mobile ? styles.menuItemTouch : undefined}>
            {current && <Icon svg={current.icon} size={16} color='neutralFaded' />}
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              {themes.map(({ value, label, icon }) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  closeOnClick
                  style={mobile ? styles.menuItemTouch : undefined}
                >
                  <Icon svg={icon} size={16} color='neutralFaded' />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link to='/' />}
          style={mobile ? styles.menuItemTouch : undefined}
        >
          <Icon svg={LogOut} size={16} color='neutralFaded' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
