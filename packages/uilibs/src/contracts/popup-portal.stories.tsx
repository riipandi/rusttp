import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, screen, userEvent, waitFor } from 'storybook/test'
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList
} from '../base/autocomplete'
import { Button } from '../base/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '../base/combobox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../base/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../base/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '../base/popover'
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from '../base/preview-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../base/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../base/tooltip'
import { ThemeScope } from '../theme/theme-scope'

const meta = {
  title: 'Contracts/Popup portal',
  parameters: {
    // Eight popups open at once on purpose: they do not fit a phone's width side by side.
    overflow: 'allowed'
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  scope: { display: 'flex', flexWrap: 'wrap', gap: 16, padding: 16 }
})

const spells = ['Lumos', 'Nox']

/**
 * Every anchored popup opens into the nearest `ThemeScope`'s portal element, so a popup keeps the
 * scope's color mode. `PopupShell` owns that, and this story fails when one wrapper stops using it.
 */
export const PortalsIntoTheScope: Story = {
  name: 'Portals into the scope',
  render: () => (
    <ThemeScope colorMode='inverted' style={styles.scope} data-testid='scope'>
      <Popover defaultOpen>
        <PopoverTrigger render={<Button variant='outline' />}>Popover</PopoverTrigger>
        <PopoverContent data-testid='popover'>Wingardium Leviosa</PopoverContent>
      </Popover>
      <TooltipProvider delay={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button variant='outline' />}>Tooltip</TooltipTrigger>
          <TooltipContent data-testid='tooltip'>Alohomora</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PreviewCard defaultOpen>
        <PreviewCardTrigger render={<Button variant='outline' />}>Preview card</PreviewCardTrigger>
        <PreviewCardContent data-testid='preview-card'>@dumbledore</PreviewCardContent>
      </PreviewCard>
      <Select defaultOpen defaultValue='lumos'>
        <SelectTrigger aria-label='Spell'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent data-testid='select'>
          <SelectItem value='lumos'>Lumos</SelectItem>
          <SelectItem value='nox'>Nox</SelectItem>
        </SelectContent>
      </Select>
      <Combobox defaultOpen items={spells}>
        <ComboboxInput aria-label='Combobox spell' />
        <ComboboxContent data-testid='combobox'>
          <ComboboxList>
            {(spell: string) => (
              <ComboboxItem key={spell} value={spell}>
                {spell}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Autocomplete defaultOpen items={spells}>
        <AutocompleteInput aria-label='Autocomplete spell' />
        <AutocompleteContent data-testid='autocomplete'>
          <AutocompleteList>
            {(spell: string) => (
              <AutocompleteItem key={spell} value={spell}>
                {spell}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger render={<Button variant='outline' />}>
          Dropdown menu
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid='dropdown-menu'>
          <DropdownMenuItem>Accio</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ContextMenu>
        <ContextMenuTrigger>Right-click the map</ContextMenuTrigger>
        <ContextMenuContent data-testid='context-menu'>
          <ContextMenuItem>Mischief managed</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </ThemeScope>
  ),
  play: async ({ canvas }) => {
    const page = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    const inverted = page === 'dark' ? 'light' : 'dark'
    const inScope = async (id: string) => {
      const popup = await screen.findByTestId(id)
      // Each popup sits outside the scope's own DOM, inside its themed portal element.
      await waitFor(async () => {
        await expect(canvas.getByTestId('scope').contains(popup)).toBe(false)
        await expect(popup.closest('[data-theme-scope-portal]')).toHaveAttribute(
          'data-color-mode',
          inverted
        )
      })
    }
    // The seven popups that open by default are read before the right click: the context menu is
    // a pointer press outside the others, and a loaded WebKit runner dismisses them while it opens.
    for (const id of [
      'popover',
      'tooltip',
      'preview-card',
      'select',
      'combobox',
      'autocomplete',
      'dropdown-menu'
    ]) {
      await inScope(id)
    }
    await userEvent.pointer({
      keys: '[MouseRight]',
      target: canvas.getByText('Right-click the map')
    })
    await inScope('context-menu')
  }
}
