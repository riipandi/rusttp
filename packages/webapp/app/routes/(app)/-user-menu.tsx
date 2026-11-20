import { LogOut, Monitor, Moon, Shield, Sun, User } from '@keyline-icons/react'
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

// An item with a `to` navigates; the rest are placeholders until a route is wired in.
const accountItems = [
  { label: 'Account', icon: User, to: '/settings/account' },
  { label: 'Security', icon: Shield, to: '/settings/security' }
] satisfies UserMenuItem[]

const profile = {
  name: 'Hermione Granger',
  email: 'hermione.granger@example.com',
  initials: 'HG'
}

// The customer dashboard's account menu: the avatar alone, in the top bar.
export function UserMenu() {
  const { theme = 'system', setTheme } = useTheme()
  const current = themes.find((item) => item.value === theme) ?? themes[2]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' size='icon-md' aria-label='Account menu' style={styles.trigger} />
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
          {accountItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              render={'to' in item ? <Link to={item.to} /> : undefined}
            >
              <Icon svg={item.icon} size={16} color='neutralFaded' />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {current && <Icon svg={current.icon} size={16} color='neutralFaded' />}
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              {themes.map(({ value, label, icon }) => (
                <DropdownMenuRadioItem key={value} value={value} closeOnClick>
                  <Icon svg={icon} size={16} color='neutralFaded' />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to='/' />}>
          <Icon svg={LogOut} size={16} color='neutralFaded' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
