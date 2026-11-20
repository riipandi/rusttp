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
import { Link } from '@tanstack/react-router'
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

// Placeholders: none of these has a route yet, so they do nothing until one is wired in.
const accountItems = [
  { label: 'Profile', icon: User },
  { label: 'Settings', icon: Settings },
  { label: 'API keys', icon: Key }
]

const profile = { name: 'Hermione Granger', email: 'hermione.granger@example.com', initials: 'HG' }

/**
 * `avatar` is the avatar alone (a top bar); `row` is the whole account row, avatar, name, and
 * email, as one target (a sidebar), and opens upward from its start edge.
 */
export function UserMenu({ variant = 'avatar' }: { variant?: 'avatar' | 'row' }) {
  const { theme = 'system', setTheme } = useTheme()
  const current = themes.find((item) => item.value === theme) ?? themes[2]
  const row = variant === 'row'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size={row ? 'lg' : 'icon-md'}
            aria-label='Account menu'
            style={row ? styles.row : styles.trigger}
          />
        }
      >
        <Avatar size='sm'>
          <AvatarFallback style={styles.triggerInitials}>{profile.initials}</AvatarFallback>
        </Avatar>
        {row && (
          <>
            <span {...stylex.props(styles.rowIdentity)}>
              <span {...stylex.props(styles.menuName)} title={profile.name}>
                {profile.name}
              </span>
              <span {...stylex.props(styles.menuEmail)} title={profile.email}>
                {profile.email}
              </span>
            </span>
            <span {...stylex.props(styles.rowChevron)}>
              <Icon svg={ChevronsUpDown} size={16} color='neutralFaded' />
            </span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={row ? 'top' : 'bottom'}
        align={row ? 'start' : 'end'}
        sideOffset={8}
        style={row ? [styles.menu, styles.menuRow] : styles.menu}
      >
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
          {accountItems.map(({ label, icon }) => (
            <DropdownMenuItem key={label}>
              <Icon svg={icon} size={16} color='neutralFaded' />
              {label}
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
