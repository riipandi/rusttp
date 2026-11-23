import { Bin, Copy, Mail } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { cellOf, expectDisabledLook } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Button } from '../button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from './dropdown-menu.component'

const meta = {
  title: 'Base Components/DropdownMenu',
  component: DropdownMenu,
  tags: [] // ['autodocs']
} satisfies Meta<typeof DropdownMenu>

type Story = StoryObj<typeof meta>

export default meta

export const Playground: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' />}>Open the menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Gringotts</DropdownMenuLabel>
          <DropdownMenuItem>Vault holder</DropdownMenuItem>
          <DropdownMenuItem>Galleon balance</DropdownMenuItem>
          <DropdownMenuItem>Vault settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Disapparate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Open the menu' }))
    await body.findByRole('menu')
    await expect(body.getByRole('menuitem', { name: 'Vault holder' })).toBeInTheDocument()

    // Escape dismisses the menu.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())
  }
}

/** The disabled item stays in the list but takes no action; a disabled trigger never opens the menu. */
export const States: Story = {
  render: () => (
    <Axis axis='disabled' rows={['item', 'trigger'] as const}>
      {(part) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant='outline' />} disabled={part === 'trigger'}>
            Spells {part}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>Gemino</DropdownMenuItem>
              <DropdownMenuItem disabled={part === 'item'}>
                Archive (Ministry pending)
              </DropdownMenuItem>
              <DropdownMenuItem>Evanesco</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body)

    const item = within(cellOf(canvasElement, 'disabled', 'item')).getByRole('button', {
      name: 'Spells item'
    })
    await userEvent.click(item)
    await body.findByRole('menu')
    const archive = body.getByRole('menuitem', { name: 'Archive (Ministry pending)' })
    await expect(archive).toHaveAttribute('data-disabled')
    // Menu rows dim but keep the default cursor, unlike a form control.
    await expectDisabledLook(archive, { cursor: false })
    // Choosing it does nothing: the menu stays open.
    await userEvent.click(archive)
    await expect(body.getByRole('menu')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())

    const trigger = within(cellOf(canvasElement, 'disabled', 'trigger')).getByRole('button', {
      name: 'Spells trigger'
    })
    await expect(trigger).toBeDisabled()
    await expectDisabledLook(trigger)
  }
}

/** The item `color`: `primary` marks the recommended item, `critical` the one that destroys something. */
export const Colors: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' />}>
        Prophet article options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Revise</DropdownMenuItem>
        <DropdownMenuItem color='primary'>Gemino</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem color='critical'>Evanesco</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Prophet article options' }))
    await body.findByRole('menu')
    const color = (name: string) => getComputedStyle(body.getByRole('menuitem', { name })).color
    // Three roles, three text colors.
    await expect(new Set([color('Revise'), color('Gemino'), color('Evanesco')]).size).toBe(3)
  }
}

/** A glyph before the label; it is decoration, so each item is still named by its label. */
export const Icons: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' />}>Owl post</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={Mail}>Send an owl</DropdownMenuItem>
        <DropdownMenuItem icon={Copy}>Gemino</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={Bin} color='critical'>
          Evanesco
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Owl post' }))
    await body.findByRole('menu')
    for (const name of ['Send an owl', 'Gemino', 'Evanesco']) {
      // The name is the label alone, and the hidden glyph comes first.
      const item = body.getByRole('menuitem', { name })
      await expect(item).toHaveAccessibleName(name)
      await expect(item.firstElementChild?.tagName.toLowerCase()).toBe('svg')
      await expect(item.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    }
    // The glyph takes the item's text color, so a critical item's glyph is critical too.
    const evanesco = body.getByRole('menuitem', { name: 'Evanesco' })
    await expect(getComputedStyle(evanesco.firstElementChild ?? evanesco).color).toBe(
      getComputedStyle(evanesco).color
    )
  }
}

export const Checkboxes: Story = {
  name: 'Checkbox and radio items',
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' />}>Map options</DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Menu labels are Base UI GroupLabels — they must live inside a
            Group or RadioGroup. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Enchantments</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>Show whispers</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Show traces</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup defaultValue='bottom'>
          <DropdownMenuLabel>Map position</DropdownMenuLabel>
          <DropdownMenuRadioItem value='top'>Ceiling</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='bottom'>Floor</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Map options' }))
    await body.findByRole('menu')

    // Checkbox items toggle open state.
    const traces = body.getByRole('menuitemcheckbox', { name: 'Show traces' })
    await expect(traces).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(traces)
    await expect(traces).toHaveAttribute('aria-checked', 'true')

    // Radio items switch exclusively.
    await userEvent.click(body.getByRole('menuitemradio', { name: 'Ceiling' }))
    await expect(body.getByRole('menuitemradio', { name: 'Ceiling' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(body.getByRole('menuitemradio', { name: 'Floor' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  }
}

export const RadioGroup: Story = {
  name: 'Radio group',
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' />}>
        Incantation size
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Menu labels are Base UI GroupLabels — they must live inside a
            Group or RadioGroup. */}
        <DropdownMenuRadioGroup defaultValue='md'>
          <DropdownMenuLabel>Scroll size</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value='sm'>Imp</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='md'>Wizard</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='lg'>Giant</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const Shortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' />}>
        Edit the Prophet
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          Sever
          <DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Gemino
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Reparo
          <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Select every scroll
          <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const Submenu: Story = {
  name: 'Submenu, shortcuts, critical',
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant='outline' />}>Quill actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          New article
          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Send by Owl</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email the Prophet</DropdownMenuItem>
            <DropdownMenuItem>Gemino the link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem color='critical'>
          Evanesco
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
