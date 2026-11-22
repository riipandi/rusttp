import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { cellOf, expectDockedTo } from '../../contracts/control-sizes'
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

const meta = {
  title: 'Base Components/Drawer',
  component: Drawer,
  argTypes: {
    showSwipeHandle: { control: 'boolean' },
    swipeDirection: { control: 'radio', options: ['up', 'right', 'down', 'left'] }
  },
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

export const Playground: Story = {
  args: { showSwipeHandle: true },
  render: (args) => (
    <Drawer {...args}>
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
