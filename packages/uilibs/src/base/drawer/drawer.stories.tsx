import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { backdropOf, cellOf, expectDockedTo } from '../../contracts/control-sizes'
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
      include: ['swipeDirection', 'showSwipeHandle', 'modal', 'blurredOverlay']
    }
  },
  argTypes: {
    swipeDirection: { control: 'radio', options: Object.keys(drawerDirections) },
    showSwipeHandle: { control: 'boolean' },
    modal: { control: 'radio', options: [true, false, 'trap-focus'] },
    blurredOverlay: { control: 'boolean' }
  },
  args: { showSwipeHandle: true, swipeDirection: 'down', modal: true, blurredOverlay: false },
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
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Open the vault' }))
    const dialog = await body.findByRole('dialog')
    await expect(body.getByRole('heading', { name: 'Brew Polyjuice' })).toBeInTheDocument()

    // Footer close buttons dismiss the drawer.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())

    await userEvent.click(canvas.getByRole('button', { name: 'Open the vault' }))
    await body.findByRole('dialog')
    await userEvent.click(body.getByRole('button', { name: 'Begin brewing' }))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  }
}

/** The drawer docks to the edge it is swiped toward. */
export const Directions: Story = {
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
    const body = within(document.body)
    const edges = { up: 'top', right: 'right', down: 'bottom', left: 'left' } as const
    for (const direction of directions) {
      await userEvent.click(
        within(cellOf(canvasElement, 'direction', direction)).getByRole('button', {
          name: direction
        })
      )
      const dialog = await body.findByRole('dialog')
      await expectDockedTo(dialog, edges[direction])
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    }
  }
}

const overlays = ['plain', 'blurred'] as const

/** `blurredOverlay` blurs the page behind the backdrop by one unit step. */
export const Overlays: Story = {
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
    const body = within(document.body)
    const filters: string[] = []
    for (const overlay of overlays) {
      await userEvent.click(
        within(cellOf(canvasElement, 'overlay', overlay)).getByRole('button', {
          name: `Open ${overlay}`
        })
      )
      const dialog = await body.findByRole('dialog', { name: `Overlay ${overlay}` })
      // The popup sits in the viewport, which is the backdrop's sibling.
      filters.push(getComputedStyle(backdropOf(dialog.parentElement!)).backdropFilter)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    }
    await expect(filters).toEqual(['none', 'blur(4px)'])
  }
}
