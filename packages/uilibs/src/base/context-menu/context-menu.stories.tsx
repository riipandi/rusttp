import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { cellOf, expectDisabledLook, expectHighlightedItem } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, fontSize, fontFamily, radius, stroke } from '../../styles/tokens.stylex'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from './context-menu.component'

const meta = {
  title: 'Base Components/ContextMenu',
  component: ContextMenu,
  tags: [] // ['autodocs']
} satisfies Meta<typeof ContextMenu>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  trigger: {
    alignItems: 'center',
    borderColor: colors.borderNeutral,
    borderRadius: radius.large,
    borderStyle: 'dashed',
    borderWidth: stroke.ring1,
    color: colors.foregroundNeutral,
    display: 'flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    height: container.xxsmall,
    justifyContent: 'center',
    width: container.small,
    paddingInline: 16,
    textAlign: 'center'
  }
})

export default meta

type PlaygroundArgs = ComponentProps<typeof ContextMenu> &
  Pick<ComponentProps<typeof ContextMenuContent>, 'side' | 'sideOffset' | 'align' | 'alignOffset'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: ['side', 'sideOffset', 'align', 'alignOffset', 'disabled']
    }
  },
  argTypes: {
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    sideOffset: { control: 'number' },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    alignOffset: { control: 'number' },
    disabled: { control: 'boolean' }
  },
  args: { side: 'right', sideOffset: 0, align: 'start', alignOffset: 4, disabled: false },
  render: ({ side, sideOffset, align, alignOffset, ...args }) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger style={styles.trigger}>Right-click the map</ContextMenuTrigger>
      <ContextMenuContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <ContextMenuItem>
          Retrace steps
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Follow the dot
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More enchantments</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Wipe the map…</ContextMenuItem>
            <ContextMenuItem>Add a secret passage…</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Marauder settings</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem defaultChecked>Show secret passages</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Show real names</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup defaultValue='padfoot'>
          <ContextMenuRadioItem value='padfoot'>Sirius Black</ContextMenuRadioItem>
          <ContextMenuRadioItem value='prongs'>James Potter</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem color='critical'>Mischief managed</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByText('Right-click the map')

    // Right-click opens the menu with all item groups.
    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })
    await screen.findByRole('menu')
    await expect(screen.getByRole('menuitem', { name: /retrace steps/i })).toBeInTheDocument()

    // A highlighted item draws its state. Hover and the arrows both set it, but WebKit does not
    // highlight on a simulated hover over a context menu, so the key is the portable way in. Focus
    // reaches the menu a frame after it opens, and a key sent earlier is lost on a loaded runner,
    // so Home repeats until it lands (it is idempotent).
    const retrace = await screen.findByRole('menuitem', { name: /retrace steps/i })
    await waitFor(async () => {
      await userEvent.keyboard('{Home}')
      await expect(retrace).toHaveAttribute('data-highlighted')
    })
    await expectHighlightedItem(retrace)

    // Disabled items render disabled.
    await expect(screen.getByRole('menuitem', { name: /follow the dot/i })).toHaveAttribute(
      'data-disabled'
    )

    // Checkbox items toggle without closing the menu.
    const showRealNames = screen.getByRole('menuitemcheckbox', { name: 'Show real names' })
    await expect(showRealNames).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(showRealNames)
    await expect(showRealNames).toHaveAttribute('aria-checked', 'true')

    // Selecting a regular item closes the menu.
    await userEvent.click(screen.getByRole('menuitem', { name: /retrace steps/i }))
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  }
}

/** A disabled item takes no action; a disabled menu never opens. */
export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ContextMenu>
  <ContextMenuTrigger style={…}>Right-click the item</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Re-ink the map</ContextMenuItem>
    <ContextMenuItem disabled>Follow the dot</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>

// A disabled menu never opens: <ContextMenu disabled>…</ContextMenu>`
      }
    }
  },
  render: () => (
    <Axis axis='disabled' rows={['item', 'menu'] as const}>
      {(part) => (
        <ContextMenu disabled={part === 'menu'}>
          <ContextMenuTrigger style={styles.trigger}>Right-click the {part}</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Re-ink the map</ContextMenuItem>
            <ContextMenuItem disabled={part === 'item'}>Follow the dot</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const item = within(cellOf(canvasElement, 'disabled', 'item')).getByText('Right-click the item')
    await userEvent.pointer({ keys: '[MouseRight]', target: item })
    await screen.findByRole('menu')
    const follow = screen.getByRole('menuitem', { name: 'Follow the dot' })
    await expect(follow).toHaveAttribute('data-disabled')
    // Menu rows dim but keep the default cursor, unlike a form control.
    await expectDisabledLook(follow, { text: true, cursor: false })
    await userEvent.click(follow)
    await expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())

    const menu = within(cellOf(canvasElement, 'disabled', 'menu')).getByText('Right-click the menu')
    await userEvent.pointer({ keys: '[MouseRight]', target: menu })
    await expect(screen.queryByRole('menu')).toBeNull()
  }
}

const colorInColors = (name: string) =>
  getComputedStyle(screen.getByRole('menuitem', { name })).color

/** The item `color`: `primary` marks the recommended item, `critical` the one that destroys something. */
export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ContextMenu>
  <ContextMenuTrigger style={…}>Right-click the map</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Re-ink the map</ContextMenuItem>
    <ContextMenuItem color='primary'>Duplicate parchment</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem color='critical'>Mischief managed</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`
      }
    }
  },
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger style={styles.trigger}>Right-click the map</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Re-ink the map</ContextMenuItem>
        <ContextMenuItem color='primary'>Duplicate parchment</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem color='critical'>Mischief managed</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvas }) => {
    await userEvent.pointer({
      keys: '[MouseRight]',
      target: canvas.getByText('Right-click the map')
    })
    await screen.findByRole('menu')
    await expect(
      new Set([
        colorInColors('Re-ink the map'),
        colorInColors('Duplicate parchment'),
        colorInColors('Mischief managed')
      ]).size
    ).toBe(3)
  }
}

export const Submenu: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ContextMenu>
  <ContextMenuTrigger style={…}>Right-click the map</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>I solemnly swear…</ContextMenuItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger>More enchantments</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Chart a new passage…</ContextMenuItem>
        <ContextMenuItem>Add a secret passage…</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Marauder settings</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>`
      }
    }
  },
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger style={styles.trigger}>Right-click the map</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>I solemnly swear…</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More enchantments</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Chart a new passage…</ContextMenuItem>
            <ContextMenuItem>Add a secret passage…</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Marauder settings</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export const Checkboxes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ContextMenu>
  <ContextMenuTrigger style={…}>Right-click the map</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuGroup>
      <ContextMenuLabel>Map layers</ContextMenuLabel>
      <ContextMenuCheckboxItem defaultChecked>Show secret passages</ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem>Show real names</ContextMenuCheckboxItem>
    </ContextMenuGroup>
  </ContextMenuContent>
</ContextMenu>`
      }
    }
  },
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger style={styles.trigger}>Right-click the map</ContextMenuTrigger>
      <ContextMenuContent>
        {/* Menu labels are Base UI GroupLabels — they must live inside a
            Group or RadioGroup. */}
        <ContextMenuGroup>
          <ContextMenuLabel>Map layers</ContextMenuLabel>
          <ContextMenuCheckboxItem defaultChecked>Show secret passages</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Show real names</ContextMenuCheckboxItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export const Radio: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger style={styles.trigger}>Right-click the map</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuRadioGroup defaultValue='padfoot'>
          <ContextMenuRadioItem value='padfoot'>Sirius Black</ContextMenuRadioItem>
          <ContextMenuRadioItem value='prongs'>James Potter</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        {/* A radio item outside its RadioGroup has no context — plain item. */}
        <ContextMenuItem disabled>Add a new Marauder…</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function Parchment({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <ContextMenu defaultOpen={defaultOpen}>
      <ContextMenuTrigger style={styles.trigger}>Right-click the parchment</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Re-ink the map</ContextMenuItem>
        <ContextMenuItem disabled>Follow the dot</ContextMenuItem>
        <ContextMenuItem>Chart a passage</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More enchantments</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Wipe the map</ContextMenuItem>
            <ContextMenuItem>Add a secret passage</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem color='critical'>Mischief managed</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// The a11y gate runs after `play`, when a menu a play opened has closed again: this story keeps
// the menu open so the gate checks it.
export const Open: Story = {
  render: () => <Parchment defaultOpen />,
  play: async () => {
    const menu = await screen.findByRole('menu')
    await waitFor(() => expect(menu).toBeVisible())
    await expect(within(menu).getByRole('menuitem', { name: 'Re-ink the map' })).toBeVisible()
  }
}

// The text of the focused element: focus moves at once, while the menu count lags a submenu's
// animation, so the submenu keys are guarded on it.
const focused = () => document.activeElement?.textContent ?? ''

const highlightedInKeyboard = () =>
  screen.queryAllByRole('menuitem').find((item) => item.hasAttribute('data-highlighted'))

const highlightedName = () => highlightedInKeyboard()?.textContent ?? null

/** Arrows, Home, and End move the highlight; Enter picks an item; ArrowRight opens a submenu; Escape closes. */
export const Keyboard: Story = {
  render: () => <Parchment />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByText('Right-click the parchment')

    // The pointer opens the menu: a context menu has no key that opens it.
    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })
    await screen.findByRole('menu')

    // Home pins the start, so each arrow's step is the same in every engine. A disabled item stays
    // in the arrow order, and Enter on it does nothing. Focus reaches a menu opened by the pointer
    // late on a loaded runner, which the 10 s default of `pressUntil` covers.
    await pressUntil('{Home}', () => expect(highlightedName()).toBe('Re-ink the map'))
    await pressUntil('{ArrowDown}', () => expect(highlightedName()).toBe('Follow the dot'), {
      when: () => highlightedName() === 'Re-ink the map'
    })
    await userEvent.keyboard('{Enter}')
    await expect(screen.getByRole('menu')).toBeInTheDocument()
    await expect(highlightedName()).toBe('Follow the dot')
    await pressUntil('{ArrowUp}', () => expect(highlightedName()).toBe('Re-ink the map'), {
      when: () => highlightedName() === 'Follow the dot'
    })
    await pressUntil('{End}', () => expect(highlightedName()).toBe('Mischief managed'))

    // ArrowRight on the submenu trigger opens its submenu, and ArrowLeft closes it again.
    await pressUntil('{Home}', () => expect(highlightedName()).toBe('Re-ink the map'))
    await pressUntil('{ArrowDown}', () => expect(highlightedName()).toBe('Follow the dot'), {
      when: () => highlightedName() === 'Re-ink the map'
    })
    await pressUntil('{ArrowDown}', () => expect(highlightedName()).toBe('Chart a passage'), {
      when: () => highlightedName() === 'Follow the dot'
    })
    await pressUntil(
      '{ArrowDown}',
      () =>
        expect(screen.getByRole('menuitem', { name: 'More enchantments' })).toHaveAttribute(
          'data-highlighted'
        ),
      { when: () => highlightedName() === 'Chart a passage' }
    )
    // A second ArrowLeft on the root menu would close it, so each key is guarded on where focus is.
    await pressUntil('{ArrowRight}', () => expect(screen.getAllByRole('menu')).toHaveLength(2), {
      when: () => focused() === 'More enchantments'
    })
    await pressUntil('{ArrowLeft}', () => expect(screen.getAllByRole('menu')).toHaveLength(1), {
      when: () => ['Wipe the map', 'Add a secret passage'].includes(focused())
    })

    // Enter picks the highlighted item and closes the menu.
    await pressUntil('{Home}', () => expect(highlightedName()).toBe('Re-ink the map'))
    await pressUntil('{Enter}', () => expect(screen.queryByRole('menu')).toBeNull(), {
      when: () => !!screen.queryByRole('menu')
    })

    // Escape closes a reopened menu.
    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })
    await screen.findByRole('menu')
    await pressUntil('{Escape}', () => expect(screen.queryByRole('menu')).toBeNull())
  }
}
