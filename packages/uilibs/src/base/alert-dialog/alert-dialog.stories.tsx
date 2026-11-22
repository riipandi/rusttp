import { Bin } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as React from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Icon } from '../../extra/icon'
import { Button } from '../button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from './alert-dialog.component'

const meta = {
  title: 'Base Components/AlertDialog',
  component: AlertDialog,
  tags: [] // ['autodocs']
} satisfies Meta<typeof AlertDialog>

type Story = StoryObj<typeof meta>

const colorNames = ['primary', 'neutral', 'critical', 'positive', 'warning'] as const
const variantNames = ['solid', 'faded', 'outline', 'ghost'] as const

/** One dialog per value of the prop, so each trigger opens the dialog under test. */
function ActionDialog({
  label,
  variant,
  color
}: {
  label: string
  variant?: (typeof variantNames)[number]
  color?: (typeof colorNames)[number]
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant='outline' />}>{label}</AlertDialogTrigger>
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm {label}?</AlertDialogTitle>
          <AlertDialogDescription>The action below takes the {label} look.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={variant} color={color}>
            Proceed {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Opens the dialog in `cell`, reads the look of its action, and closes it again. */
async function actionLook(cell: HTMLElement, label: string) {
  const body = within(document.body)
  await userEvent.click(within(cell).getByRole('button', { name: label }))
  const action = within(await body.findByRole('alertdialog')).getByRole('button', {
    name: `Proceed ${label}`
  })
  const style = getComputedStyle(action)
  const look = [style.backgroundColor, style.borderTopWidth, style.borderTopColor, style.color]
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull())
  return look.join('|')
}

function deleteAccount() {
  return new Promise<void>((resolve) => setTimeout(resolve, 1500))
}

export default meta

export const Playground: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant='outline' />}>
        Seal the cryptex
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure, Professor?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The cryptex will seal itself forever and the Priory&apos;s
            secret will be lost to the Illuminati.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction color='critical'>Seal</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Seal the cryptex' }))

    const dialog = within(document.body).getByRole('alertdialog')
    await expect(
      within(document.body).getByRole('heading', { name: /absolutely sure/i })
    ).toBeInTheDocument()

    // Cancel dismisses the dialog.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull())

    // Destructive confirm also dismisses.
    await userEvent.click(canvas.getByRole('button', { name: 'Seal the cryptex' }))
    const reopened = within(document.body).getByRole('alertdialog')
    await userEvent.click(within(reopened).getByRole('button', { name: 'Seal' }))
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull())
  }
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={['sm', 'md'] as const}>
      {(size) => (
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant='outline' />}>{size}</AlertDialogTrigger>
          <AlertDialogContent size={size}>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave without casting Lumos?</AlertDialogTitle>
              <AlertDialogDescription>
                Your unfinished incantations will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction color='critical'>Disapparate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Axis>
  ),
  // `md` widens at 660 px and up, so on a narrow canvas both sizes are the `sm` width: `md` is
  // never narrower than `sm`, and `sm` never exceeds the medium container (20rem; less on a narrower viewport).
  play: async ({ canvasElement }) => {
    const body = within(document.body)
    const width = async (size: string) => {
      await userEvent.click(
        within(cellOf(canvasElement, 'size', size)).getByRole('button', { name: size })
      )
      const dialog = await body.findByRole('alertdialog')
      const { width: boxWidth } = dialog.getBoundingClientRect()
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull())
      return boxWidth
    }
    const sm = await width('sm')
    await expect(sm).toBeLessThanOrEqual(320)
    await expect(await width('md')).toBeGreaterThanOrEqual(sm)
  }
}

/** The action takes the Button `variant`; each look differs from the others. */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={variantNames}>
      {(variant) => <ActionDialog label={variant} variant={variant} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const looks = new Set<string>()
    for (const variant of variantNames) {
      looks.add(await actionLook(cellOf(canvasElement, 'variant', variant), variant))
    }
    await expect(looks.size).toBe(variantNames.length)
  }
}

/** The action takes the Button `color`; each color differs from the others. */
export const Colors: Story = {
  render: () => (
    <Axis axis='color' rows={colorNames}>
      {(color) => <ActionDialog label={color} color={color} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const looks = new Set<string>()
    for (const color of colorNames) {
      looks.add(await actionLook(cellOf(canvasElement, 'color', color), color))
    }
    await expect(looks.size).toBe(colorNames.length)
  }
}

export const Media: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant='outline' />}>
        Empty the Room of Requirement
      </AlertDialogTrigger>
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <AlertDialogMedia color='critical'>
            <Icon svg={Bin} size={24} color='critical' />
          </AlertDialogMedia>
          <AlertDialogTitle>Empty the room?</AlertDialogTitle>
          <AlertDialogDescription>
            Everything hidden inside will be permanently vanished from the castle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction color='critical'>Vanish</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    const [deleting, setDeleting] = React.useState(false)

    async function handleDelete() {
      setDeleting(true)
      await deleteAccount()
      setDeleting(false)
      setOpen(false)
    }

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button color='critical' />}>
          Close the Gringotts vault
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close your vault?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The goblins will permanently close the vault and melt
              down every remaining Galleon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              color='critical'
              loading={deleting}
              onClick={(event) => {
                // Keep the dialog open until the work is done, then close it through `open`.
                event.preventBaseUIHandler()
                void handleDelete()
              }}
            >
              Close the vault
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close the Gringotts vault' }))

    const dialog = within(document.body).getByRole('alertdialog')
    const action = within(dialog).getByRole('button', { name: 'Close the vault' })

    await userEvent.click(action)

    // The action stays open and busy, under its own name, while the promise runs.
    await expect(action).toHaveAttribute('aria-busy', 'true')
    await expect(within(document.body).getByRole('alertdialog')).toBeInTheDocument()
    await expect(within(document.body).getByRole('button', { name: 'Cancel' })).toBeDisabled()

    // Resolving the action closes the dialog.
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull(), {
      timeout: 4000
    })
  }
}
