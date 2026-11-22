import { Monitor, Moon, Sun } from '@keyline-icons/react'
import type * as stylex from '@stylexjs/stylex'
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from 'uilibs/base/dropdown-menu'
import { Icon } from 'uilibs/extra/icon'
import { useTheme } from 'uilibs/theme'
import { type Messages, useMessages } from '#/libraries/messages'

// A function, not a constant: the labels are messages, so they follow the language the user picked.
// The command bar lists the same choices.
export const themes = (m: Messages) => [
  { value: 'light', label: m.theme_light(), icon: Sun },
  { value: 'dark', label: m.theme_dark(), icon: Moon },
  { value: 'system', label: m.theme_system(), icon: Monitor }
]

/** The "Theme" submenu of an account or preferences menu. `style` sizes the rows, for touch. */
export function ThemeMenu({ style }: { style?: stylex.StyleXStyles }) {
  const m = useMessages()
  const { theme = 'system', setTheme } = useTheme()
  const options = themes(m)
  const current = options.find((item) => item.value === theme) ?? options[2]

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger style={style}>
        {current && <Icon svg={current.icon} size={16} color='neutralFaded' />}
        {m.theme_label()}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {options.map(({ value, label, icon }) => (
            <DropdownMenuRadioItem key={value} value={value} closeOnClick style={style}>
              <Icon svg={icon} size={16} color='neutralFaded' />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
