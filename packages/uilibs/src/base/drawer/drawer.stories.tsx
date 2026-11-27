import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { backdropOf, cellOf, expectDockedTo, expectTypeRole } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { Axis } from '../../contracts/story-axes'
import { Button } from '../button'
import { Drawer, type DrawerSwipeDirection } from './drawer.component'
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from './drawer.component'
import { drawerDirections } from './drawer.stylex'

const meta = {
  title: 'Base Components/Drawer',
  component: Drawer,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Drawer>

type Story = StoryObj<typeof meta>

const directions: DrawerSwipeDirection[] = ['up', 'right', 'down', 'left']

const styles = stylex.create({
  // Vertical drawers (up/down) span the full viewport width; keep their text
  // in a readable, centered column instead of stretching edge to edge.
  headerColumn: {
    marginInline: 'auto',
    maxWidth: 448,
    width: '100%'
  }
})

export default meta

// The overlay lives on `DrawerContent`, so its prop reaches the story as an arg beside the root's.
type PlaygroundArgs = ComponentProps<typeof Drawer> &
  Pick<ComponentProps<typeof DrawerContent>, 'blurredOverlay'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'swipeDirection',
        'showSwipeHandle',
        'modal',
        'disablePointerDismissal',
        'blurredOverlay'
      ]
    },
    docs: {
      source: {
        code: `<Drawer swipeDirection='down' showSwipeHandle>
  <DrawerTrigger render={<Button variant='outline' />}>Open the vault</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Brew Polyjuice</DrawerTitle>
      <DrawerDescription>Set your daily dosage for the potion.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <DrawerClose render={<Button />}>Begin brewing</DrawerClose>
      <DrawerClose render={<Button variant='outline' />}>Cancel</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`
      }
    }
  },
  argTypes: {
    swipeDirection: { control: 'radio', options: Object.keys(drawerDirections) },
    showSwipeHandle: { control: 'boolean' },
    modal: { control: 'radio', options: [true, false, 'trap-focus'] },
    disablePointerDismissal: { control: 'boolean' },
    blurredOverlay: { control: 'boolean' }
  },
  args: {
    showSwipeHandle: true,
    swipeDirection: 'down',
    modal: true,
    disablePointerDismissal: false,
    blurredOverlay: false
  },
  render: ({ blurredOverlay, ...args }) => (
    <Drawer {...args}>
      <DrawerTrigger render={<Button variant='outline' />}>Open the vault</DrawerTrigger>
      <DrawerContent blurredOverlay={blurredOverlay}>
        <DrawerHeader>
          <DrawerTitle>Brew Polyjuice</DrawerTitle>
          <DrawerDescription>Set your daily dosage for the potion.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Begin brewing</DrawerClose>
          <DrawerClose render={<Button variant='outline' />}>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open the vault' }))
    const dialog = await screen.findByRole('dialog')
    await expect(screen.getByRole('heading', { name: 'Brew Polyjuice' })).toBeInTheDocument()
    await expectTypeRole(screen.getByRole('heading', { name: 'Brew Polyjuice' }), 'body1')

    // Footer close buttons dismiss the drawer.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    await userEvent.click(canvas.getByRole('button', { name: 'Open the vault' }))
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Begin brewing' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }
}

/** The drawer docks to the edge it is swiped toward. */
export const Directions: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Drawer swipeDirection='left'>
  <DrawerTrigger render={<Button variant='outline' />}>left</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Owl from the left</DrawerTitle>
      <DrawerDescription>Swoops in and swipes back toward the left edge.</DrawerDescription>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`
      }
    }
  },
  render: () => (
    <Axis axis='direction' rows={directions}>
      {(direction) => (
        <Drawer swipeDirection={direction}>
          <DrawerTrigger render={<Button variant='outline' />}>{direction}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader
              style={direction === 'up' || direction === 'down' ? styles.headerColumn : undefined}
            >
              <DrawerTitle>Owl from the {direction}</DrawerTitle>
              <DrawerDescription>
                Swoops in and swipes back toward the {direction} edge.
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const edges = { up: 'top', right: 'right', down: 'bottom', left: 'left' } as const
    for (const direction of directions) {
      await userEvent.click(
        within(cellOf(canvasElement, 'direction', direction)).getByRole('button', {
          name: direction
        })
      )
      const dialog = await screen.findByRole('dialog')
      await expectDockedTo(dialog, edges[direction])
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
  }
}

const overlays = ['plain', 'blurred'] as const

/** `blurredOverlay` blurs the page behind the backdrop by one unit step. */
export const Overlays: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Drawer>
  <DrawerTrigger render={<Button variant='outline' />}>Open blurred</DrawerTrigger>
  <DrawerContent blurredOverlay>
    <DrawerHeader>
      <DrawerTitle>Overlay blurred</DrawerTitle>
      <DrawerDescription>The castle fades behind the portrait.</DrawerDescription>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`
      }
    }
  },
  render: () => (
    <Axis axis='overlay' rows={overlays}>
      {(overlay) => (
        <Drawer>
          <DrawerTrigger render={<Button variant='outline' />}>{`Open ${overlay}`}</DrawerTrigger>
          <DrawerContent blurredOverlay={overlay === 'blurred'}>
            <DrawerHeader>
              <DrawerTitle>{`Overlay ${overlay}`}</DrawerTitle>
              <DrawerDescription>The castle fades behind the portrait.</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const filters: string[] = []
    for (const overlay of overlays) {
      await userEvent.click(
        within(cellOf(canvasElement, 'overlay', overlay)).getByRole('button', {
          name: `Open ${overlay}`
        })
      )
      const dialog = await screen.findByRole('dialog', { name: `Overlay ${overlay}` })
      // The popup sits in the viewport, which is the backdrop's sibling.
      filters.push(getComputedStyle(backdropOf(dialog.parentElement!)).backdropFilter)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
    await expect(filters).toEqual(['none', 'blur(4px)'])
  }
}

function Owlery({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Drawer defaultOpen={defaultOpen}>
      <DrawerTrigger render={<Button variant='outline' />}>Open the owlery</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Send an owl</DrawerTitle>
          <DrawerDescription>The owl leaves at dawn.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Send it</DrawerClose>
          <DrawerClose render={<Button variant='outline' />}>Keep it</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// The a11y gate runs after `play`, when a drawer a play opened has closed again: this story keeps
// the popup and its backdrop open so the gate checks them.
export const Open: Story = {
  render: () => <Owlery defaultOpen />,
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Send an owl' })
    await waitFor(() => expect(dialog).toBeVisible())
    await expect(dialog).toHaveAccessibleDescription('The owl leaves at dawn.')
  }
}

const openedInKeyboard = () => screen.getByRole('dialog', { name: 'Send an owl' })
const send = () => screen.getByRole('button', { name: 'Send it' })

/** Enter or Space opens the drawer, Tab stays inside it, and Escape closes it and returns focus. */
export const Keyboard: Story = {
  render: () => <Owlery />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Open the owlery' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await pressUntil('{Enter}', openedInKeyboard, { when: () => !screen.queryByRole('dialog') })
    const dialog = openedInKeyboard()

    // Focus moves into the popup, and Tab keeps it there (five presses outrun its two buttons).
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    for (let step = 0; step < 5; step += 1) {
      await userEvent.tab()
      // Past the last control, focus lands on Base UI's focus guard first and is handed back.
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    }
    // The page behind is inert while a modal drawer is open.
    await expect(screen.queryByRole('button', { name: 'Open the owlery' })).toBeNull()

    await pressUntil('{Escape}', () => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    // Space opens it too; Enter on a footer button closes it and returns focus.
    await pressUntil(' ', openedInKeyboard, { when: () => !screen.queryByRole('dialog') })
    // Focus lands on the popup itself, and Tab moves on to its first button.
    await waitFor(() => expect(openedInKeyboard()).toHaveFocus())
    await pressUntil('{Tab}', () => expect(send()).toHaveFocus(), {
      when: () => document.activeElement === openedInKeyboard()
    })
    // One press: the control that takes it already holds focus (asserted above), and a second press
    // could land on the trigger as focus returns to it and reopen the popup. The popup stays in the
    // page for its exit animation, so the wait is longer on a loaded runner.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
