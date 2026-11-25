import { SlidersHorizontal } from '@keyline-icons/react'
import { Button } from 'uilibs/base/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'uilibs/base/dropdown-menu'
import { LanguageMenu } from '#/components/language-menu'
import { ThemeMenu } from '#/components/theme-menu'
import { useMessages } from '#/libraries/messages'

/**
 * The preferences of a page with no account menu (the landing page, the auth pages): theme and
 * language, in one menu behind an icon button at the end of the header.
 */
export function PreferencesMenu() {
  const m = useMessages()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' icon={SlidersHorizontal} aria-label={m.preferences_label()} />
        }
      />
      <DropdownMenuContent side='bottom' align='end' sideOffset={8}>
        <ThemeMenu />
        <LanguageMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
