import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import { Input } from '../../base/input'
import { cellOf, expectDockedTo } from '../../contracts/control-sizes'
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

export const Playground: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant='outline' />}>Alohomora</SheetTrigger>
      <SheetContent>
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
