import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { cellOf, expectDisabledLook } from '../../contracts/control-sizes'
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
  Pick<ComponentProps<typeof ContextMenuContent>, 'side' | 'align'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['side', 'align', 'disabled'] } },
  argTypes: {
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    disabled: { control: 'boolean' }
  },
  args: { side: 'right', align: 'start', disabled: false },
  render: ({ side, align, ...args }) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger style={styles.trigger}>Right-click the map</ContextMenuTrigger>
      <ContextMenuContent side={side} align={align}>
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
    const body = within(document.body)
    const trigger = canvas.getByText('Right-click the map')

    // Right-click opens the menu with all item groups.
    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })
    await body.findByRole('menu')
    await expect(body.getByRole('menuitem', { name: /retrace steps/i })).toBeInTheDocument()

    // Disabled items render disabled.
    await expect(body.getByRole('menuitem', { name: /follow the dot/i })).toHaveAttribute(
      'data-disabled'
    )

    // Checkbox items toggle without closing the menu.
    const showRealNames = body.getByRole('menuitemcheckbox', { name: 'Show real names' })
    await expect(showRealNames).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(showRealNames)
    await expect(showRealNames).toHaveAttribute('aria-checked', 'true')

    // Selecting a regular item closes the menu.
    await userEvent.click(body.getByRole('menuitem', { name: /retrace steps/i }))
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())
  }
}

/** A disabled item takes no action; a disabled menu never opens. */
export const States: Story = {
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
    const body = within(document.body)

    const item = within(cellOf(canvasElement, 'disabled', 'item')).getByText('Right-click the item')
    await userEvent.pointer({ keys: '[MouseRight]', target: item })
    await body.findByRole('menu')
    const follow = body.getByRole('menuitem', { name: 'Follow the dot' })
    await expect(follow).toHaveAttribute('data-disabled')
    // Menu rows dim but keep the default cursor, unlike a form control.
    await expectDisabledLook(follow, { cursor: false })
    await userEvent.click(follow)
    await expect(body.getByRole('menu')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull())

    const menu = within(cellOf(canvasElement, 'disabled', 'menu')).getByText('Right-click the menu')
    await userEvent.pointer({ keys: '[MouseRight]', target: menu })
    await expect(body.queryByRole('menu')).toBeNull()
  }
}

/** The item `color`: `primary` marks the recommended item, `critical` the one that destroys something. */
export const Colors: Story = {
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
    const body = within(document.body)
    await userEvent.pointer({
      keys: '[MouseRight]',
      target: canvas.getByText('Right-click the map')
    })
    await body.findByRole('menu')
    const color = (name: string) => getComputedStyle(body.getByRole('menuitem', { name })).color
    await expect(
      new Set([color('Re-ink the map'), color('Duplicate parchment'), color('Mischief managed')])
        .size
    ).toBe(3)
  }
}

export const Submenu: Story = {
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
