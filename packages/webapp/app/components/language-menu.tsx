import { Globe } from '@keyline-icons/react'
import type * as stylex from '@stylexjs/stylex'
import { useSelector } from '@tanstack/react-store'
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from 'uilibs/base/dropdown-menu'
import { Icon } from 'uilibs/extra/icon'
import { localeNames, localeStore } from '#/libraries/locale.store'
import { useMessages } from '#/libraries/messages'
import { isLocale, locales } from '#/paraglide/runtime'

/**
 * The "Language" submenu of an account menu, beside Theme. Choosing a language persists it and
 * re-renders the app in it (`libraries/locale.store.ts`). `style` sizes the rows, for the drawer's
 * touch-sized menu.
 */
export function LanguageMenu({ style }: { style?: stylex.StyleXStyles }) {
  const m = useMessages()
  const locale = useSelector(localeStore)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger style={style}>
        <Icon svg={Globe} size={16} color='neutral-faded' />
        {m.language_label()}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => isLocale(value) && localeStore.actions.set(value)}
        >
          {locales.map((value) => (
            <DropdownMenuRadioItem key={value} value={value} closeOnClick style={style}>
              {localeNames[value]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
