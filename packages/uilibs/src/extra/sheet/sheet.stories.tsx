import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import { Input } from '../../base/input'
import { backdropOf, cellOf, expectDockedTo, expectTypeRole } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Label } from '../label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetSide
} from './sheet.component'

const meta = {
  title: 'Extra Components/Sheet',
  component: Sheet,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Sheet>

type Story = StoryObj<typeof meta>

const sides: SheetSide[] = ['top', 'right', 'bottom', 'left']

const styles = stylex.create({
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    paddingInline: 16
  }
})

export default meta

// The look lives on `SheetContent`, so its props reach the story as args beside the root's.
type PlaygroundArgs = ComponentProps<typeof Sheet> &
  Pick<ComponentProps<typeof SheetContent>, 'side' | 'blurredOverlay' | 'showCloseButton'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['side', 'blurredOverlay', 'showCloseButton'] }
  },
  argTypes: {
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    blurredOverlay: { control: 'boolean' },
    showCloseButton: { control: 'boolean' }
  },
  args: { side: 'right', blurredOverlay: false, showCloseButton: true },
  render: ({ side, blurredOverlay, showCloseButton, ...root }) => (
    <Sheet {...root}>
      <SheetTrigger render={<Button variant='outline' />}>Alohomora</SheetTrigger>
      <SheetContent side={side} blurredOverlay={blurredOverlay} showCloseButton={showCloseButton}>
        <SheetHeader>
          <SheetTitle>Edit vault record</SheetTitle>
          <SheetDescription>
            Make changes to the vault holder here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div {...stylex.props(styles.fields)}>
          <Label>
            Account holder <Input defaultValue='Luna Lovegood' />
          </Label>
          <Label>
            Vault key <Input defaultValue='@quibbler' />
          </Label>
        </div>
        <SheetFooter>
          <SheetClose render={<Button />}>Save vault record</SheetClose>
          <SheetClose render={<Button variant='outline' />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Alohomora' }))
    const sheet = await body.findByRole('dialog')
    await expect(body.getByRole('heading', { name: 'Edit vault record' })).toBeInTheDocument()
    await expectTypeRole(body.getByRole('heading', { name: 'Edit vault record' }), 'body1')
    await expect(within(sheet).getByDisplayValue('Luna Lovegood')).toBeInTheDocument()

    // Footer close action dismisses the sheet.
    await userEvent.click(within(sheet).getByRole('button', { name: 'Save vault record' }))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  }
}

export const CloseButton: Story = {
  name: 'Close button',
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant='outline' />}>Open the ledger</SheetTrigger>
      <SheetContent labels={{ close: 'Shut the ledger' }}>
        <SheetHeader>
          <SheetTitle>Vault ledger</SheetTitle>
          <SheetDescription>Every withdrawal since 1991.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Open the ledger' }))
    await userEvent.click(await body.findByRole('button', { name: 'Shut the ledger' }))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  }
}

export const Sides: Story = {
  render: () => (
    <Axis axis='side' rows={sides}>
      {(side) => (
        <Sheet>
          <SheetTrigger render={<Button variant='outline' />}>{side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Entrance on the {side}</SheetTitle>
              <SheetDescription>
                A hidden passage opens on the {side} side of the castle.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    </Axis>
  ),
  // Docked popups do not flip: each sheet sits flush against its own edge.
  play: async ({ canvasElement }) => {
    const body = within(document.body)
    for (const side of sides) {
      await userEvent.click(
        within(cellOf(canvasElement, 'side', side)).getByRole('button', { name: side })
      )
      const dialog = await body.findByRole('dialog')
      await expectDockedTo(dialog, side)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    }
  }
}

export const NoCloseButton: Story = {
  name: 'No close button',
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant='outline' />}>Alohomora</SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Publish in the Daily Prophet</SheetTitle>
          <SheetDescription>Review the article, then publish or discard it below.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button />}>Print edition</SheetClose>
          <SheetClose render={<Button variant='outline' />}>Discard draft</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

const overlays = ['plain', 'blurred'] as const

/** `blurredOverlay` blurs the page behind the backdrop by one unit step. */
export const Overlays: Story = {
  render: () => (
    <Axis axis='overlay' rows={overlays}>
      {(overlay) => (
        <Sheet>
          <SheetTrigger render={<Button variant='outline' />}>{`Open ${overlay}`}</SheetTrigger>
          <SheetContent blurredOverlay={overlay === 'blurred'}>
            <SheetHeader>
              <SheetTitle>{`Overlay ${overlay}`}</SheetTitle>
              <SheetDescription>The castle fades behind the passage.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
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
      const sheet = await body.findByRole('dialog', { name: `Overlay ${overlay}` })
      filters.push(getComputedStyle(backdropOf(sheet)).backdropFilter)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    }
    await expect(filters).toEqual(['none', 'blur(4px)'])
  }
}
