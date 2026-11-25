import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { detectPlatform, formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'
import * as React from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import { expectHighlightedItem } from '../../contracts/control-sizes'
import { shadow } from '../../styles/colors.stylex'
import { container } from '../../styles/tokens.stylex'
import { Kbd, KbdGroup } from '../kbd'
import { Command, CommandDialog, CommandEmpty } from './command.component'
import { CommandList, CommandSeparator, CommandShortcut } from './command.component'
import { CommandGroup, CommandInput, CommandItem } from './command.component'

const meta = {
  title: 'Extra Components/Command',
  component: Command,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Command>

type Story = StoryObj<typeof meta>

const commands = [
  { value: 'expelliarmus', label: 'Expelliarmus', group: 'Spells' },
  { value: 'expecto-patronum', label: 'Expecto Patronum', group: 'Spells' },
  { value: 'wingardium-leviosa', label: 'Wingardium Leviosa', group: 'Spells' },
  { value: 'potions', label: 'Potions', group: 'Subjects', shortcut: '⌘P' },
  { value: 'divination', label: 'Divination', group: 'Subjects', shortcut: '⌘B' },
  {
    value: 'defence-against-the-dark-arts',
    label: 'Defence Against the Dark Arts',
    group: 'Subjects',
    shortcut: '⌘S'
  }
]

type CommandEntry = (typeof commands)[number]

// Base UI erases the item type, so narrow with a guard before reading it.
const itemLabel = (item: unknown): string =>
  typeof item === 'object' && item !== null && 'label' in item ? String(item.label) : ''

const commandGroups = [
  {
    value: 'spells',
    label: 'Spells',
    items: [
      { value: 'expelliarmus', label: 'Expelliarmus' },
      { value: 'expecto-patronum', label: 'Expecto Patronum' }
    ]
  },
  {
    value: 'subjects',
    label: 'Subjects',
    items: [
      { value: 'potions', label: 'Potions', shortcut: '⌘P' },
      { value: 'divination', label: 'Divination', shortcut: '⌘B' }
    ]
  }
]

const spells = [
  'Accio',
  'Aguamenti',
  'Alohomora',
  'Anapneo',
  'Aparecium',
  'Ascendio',
  'Bombarda',
  'Colloportus',
  'Confringo',
  'Confundo',
  'Descendo',
  'Deprimo',
  'Duro',
  'Engorgio',
  'Episkey',
  'Expelliarmus',
  'Expecto Patronum',
  'Ferula',
  'Finite Incantatem',
  'Flagrate',
  'Glisseo',
  'Homenum Revelio',
  'Immobulus',
  'Impedimenta',
  'Incendio',
  'Lumos',
  'Meteolojinx Recanto',
  'Muffliato',
  'Nox',
  'Obliviate',
  'Petrificus Totalus',
  'Prior Incantato',
  'Protego',
  'Reducio',
  'Rennervate',
  'Reparo',
  'Riddikulus',
  'Silencio',
  'Sonorus',
  'Stupefy',
  'Wingardium Leviosa'
].map((label) => ({ label, value: label }))

const styles = stylex.create({
  root: {
    maxWidth: container.xlarge
  }
})

export default meta

// The placeholder belongs to `CommandInput`; the rest are root props.
type PlaygroundArgs = React.ComponentProps<typeof Command> &
  Pick<React.ComponentProps<typeof CommandInput>, 'placeholder'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['placeholder', 'autoHighlight', 'disabled'] }
  },
  argTypes: {
    placeholder: { control: 'text' },
    autoHighlight: { control: 'boolean' },
    disabled: { control: 'boolean' }
  },
  args: { placeholder: 'Cast a spell or search…', autoHighlight: true, disabled: false },
  render: ({ placeholder, ...args }) => (
    <Command items={commands} itemToStringValue={itemLabel} {...args} style={styles.root}>
      <CommandInput placeholder={placeholder} />
      <CommandEmpty>No spells found.</CommandEmpty>
      <CommandList>
        {(item: CommandEntry) => (
          <CommandItem key={item.value} value={item}>
            {item.label}
            {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
          </CommandItem>
        )}
      </CommandList>
    </Command>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const input = canvas.getByPlaceholderText('Cast a spell or search…')

    // On the page the palette draws its own 1px edge, since its fill is the page's. The root is
    // the input's field wrapper's parent.
    const root = input.parentElement?.parentElement
    if (!root) throw new Error('No command root')
    await expect(getComputedStyle(root).borderTopWidth).toBe('1px')
    await expect(getComputedStyle(root).borderTopStyle).toBe('solid')

    // Typing filters the command list.
    await userEvent.type(input, 'expecto')
    await waitFor(() => expect(body.getByText('Expecto Patronum')).toBeInTheDocument())

    // The first match is highlighted (`autoHighlight`) and says so.
    await expectHighlightedItem(body.getByRole('option', { name: /Expecto Patronum/ }))

    // No match shows the empty message.
    await userEvent.clear(input)
    await userEvent.type(input, 'aquamenti maxima')
    await waitFor(() => expect(body.getByText('No spells found.')).toBeInTheDocument())
  }
}

export const Groups: Story = {
  render: () => (
    <Command items={commandGroups} style={styles.root}>
      <CommandInput placeholder='Cast a spell or search…' />
      <CommandEmpty>No spells found.</CommandEmpty>
      <CommandList>
        {(group: (typeof commandGroups)[number]) => (
          <React.Fragment key={group.value}>
            <CommandGroup heading={group.label}>
              {group.items.map((item) => (
                <CommandItem key={item.value} value={item}>
                  {item.label}
                  {'shortcut' in item && item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {group.value !== commandGroups[commandGroups.length - 1]?.value && <CommandSeparator />}
          </React.Fragment>
        )}
      </CommandList>
    </Command>
  )
}

export const Scrollable: Story = {
  render: () => (
    <Command items={spells} itemToStringValue={itemLabel} style={styles.root}>
      <CommandInput placeholder='Search spells…' />
      <CommandEmpty>No spells found.</CommandEmpty>
      <CommandList>
        {(item: (typeof spells)[number]) => (
          <CommandItem key={item.value} value={item}>
            {item.label}
          </CommandItem>
        )}
      </CommandList>
    </Command>
  )
}

export const DialogHotkey: Story = {
  name: 'Keyboard shortcut',
  render: () => {
    const [open, setOpen] = React.useState(false)

    // Toggle the dialog with Mod+J — Cmd on macOS, Ctrl on Windows/Linux.
    useHotkey('Mod+J', () => setOpen((prev) => !prev))

    return (
      <>
        <Button variant='outline' onClick={() => setOpen(true)}>
          Open the Marauder's Map
          <KbdGroup>
            <Kbd>{formatForDisplay('Mod+J')}</Kbd>
          </KbdGroup>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command items={commands} itemToStringValue={itemLabel}>
            <CommandInput placeholder='Cast a spell or search…' />
            <CommandEmpty>No spells found.</CommandEmpty>
            <CommandList>
              {(item: CommandEntry) => (
                <CommandItem key={item.value} value={item} onClick={() => setOpen(false)}>
                  {item.label}
                </CommandItem>
              )}
            </CommandList>
          </Command>
        </CommandDialog>
      </>
    )
  },
  play: async ({ canvas }) => {
    const body = within(document.body)
    const modKey = detectPlatform() === 'mac' ? 'Meta' : 'Control'

    // The Mod+J hotkey toggles the dialog.
    await userEvent.keyboard(`{${modKey}>}j{/${modKey}}`)
    await body.findByRole('dialog')
    await userEvent.keyboard(`{${modKey}>}j{/${modKey}}`)
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())

    // Opening via the button mounts the command dialog.
    await userEvent.click(canvas.getByRole('button', { name: /marauder's map/i }))
    await body.findByRole('dialog')

    // Selecting an item closes the dialog.
    await userEvent.click(body.getByText('Potions'))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  }
}

export const TranslatedDialog: Story = {
  render: () => (
    <CommandDialog
      open
      labels={{ title: 'Palet perintah', description: 'Cari perintah untuk dijalankan' }}
    >
      <Command items={commands} itemToStringValue={itemLabel}>
        <CommandInput placeholder='Cari…' />
        <CommandList>
          {(item: CommandEntry) => (
            <CommandItem key={item.value} value={item}>
              {item.label}
            </CommandItem>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  ),
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog', { name: 'Palet perintah' })
    await expect(dialog).toHaveAccessibleDescription('Cari perintah untuk dijalankan')

    // The dialog's own ring is the edge: the palette inside draws none, and the dialog lifts with
    // the overlay shadow token, the same as any other dialog.
    const input = within(dialog).getByPlaceholderText('Cari…')
    const root = input.parentElement?.parentElement
    if (!root) throw new Error('No command root')
    await expect(getComputedStyle(root).borderTopWidth).toBe('0px')
    const probe = document.createElement('div')
    probe.style.boxShadow = shadow.overlay
    document.body.append(probe)
    const overlay = getComputedStyle(probe).boxShadow
    probe.remove()
    await expect(getComputedStyle(dialog).boxShadow.endsWith(overlay)).toBe(true)
  }
}
