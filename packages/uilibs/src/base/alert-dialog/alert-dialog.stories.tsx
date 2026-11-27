import { Bin } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as React from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { backdropOf, cellOf, expectTypeRole } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { expectScrollsIntoView, untilGone } from '../../contracts/overlay'
import { Axis } from '../../contracts/story-axes'
import { Icon } from '../../extra/icon'
import { Button } from '../button'
import { buttonFills } from '../button/button.stylex'
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
import { alertDialogSizes } from './alert-dialog.stylex'

const meta = {
  title: 'Base Components/AlertDialog',
  component: AlertDialog
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
      <AlertDialogContent size='small'>
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

/** Waits for the alert dialog to leave the page: it stays for its exit transition (`data-ending-style`). */
const untilClosed = () => untilGone(() => screen.queryByRole('alertdialog'))

/** Opens the dialog in `cell`, reads the look of its action, and closes it again. */
async function actionLook(cell: HTMLElement, label: string) {
  await userEvent.click(within(cell).getByRole('button', { name: label }))
  const action = within(await screen.findByRole('alertdialog')).getByRole('button', {
    name: `Proceed ${label}`
  })
  const style = getComputedStyle(action)
  const look = [style.backgroundColor, style.borderTopWidth, style.borderTopColor, style.color]
  await userEvent.keyboard('{Escape}')
  await untilClosed()
  return look.join('|')
}

function deleteAccount(latency: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, latency))
}

export default meta

// The size lives on `AlertDialogContent` and the color on the confirming `AlertDialogAction`.
type PlaygroundArgs = React.ComponentProps<typeof AlertDialog> &
  Pick<React.ComponentProps<typeof AlertDialogContent>, 'size' | 'blurredOverlay'> &
  Pick<React.ComponentProps<typeof AlertDialogAction>, 'color' | 'variant' | 'loading'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: ['size', 'blurredOverlay', 'color', 'variant', 'loading']
    }
  },
  argTypes: {
    size: { control: 'radio', options: Object.keys(alertDialogSizes) },
    blurredOverlay: { control: 'boolean' },
    color: { control: 'select', options: Object.keys(buttonFills.solid) },
    variant: { control: 'radio', options: variantNames },
    loading: { control: 'boolean' }
  },
  args: {
    size: 'medium',
    blurredOverlay: false,
    color: 'critical',
    variant: 'solid',
    loading: false
  },
  render: ({ size, blurredOverlay, color, variant, loading, ...root }) => (
    <AlertDialog {...root}>
      <AlertDialogTrigger render={<Button variant='outline' />}>
        Seal the cryptex
      </AlertDialogTrigger>
      <AlertDialogContent size={size} blurredOverlay={blurredOverlay}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure, Professor?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The cryptex will seal itself forever and the Priory&apos;s
            secret will be lost to the Illuminati.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction color={color} variant={variant} loading={loading}>
            Seal
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Seal the cryptex' }))

    const dialog = screen.getByRole('alertdialog')
    await expect(screen.getByRole('heading', { name: /absolutely sure/i })).toBeInTheDocument()
    await expectTypeRole(screen.getByRole('heading', { name: /absolutely sure/i }), 'body1')

    // Cancel dismisses the dialog.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await untilClosed()

    // Destructive confirm also dismisses.
    await userEvent.click(canvas.getByRole('button', { name: 'Seal the cryptex' }))
    const reopened = screen.getByRole('alertdialog')
    await userEvent.click(within(reopened).getByRole('button', { name: 'Seal' }))
    await untilClosed()
  }
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AlertDialog>
  <AlertDialogTrigger render={<Button variant='outline' />}>small</AlertDialogTrigger>
  <AlertDialogContent size='small'>
    <AlertDialogHeader>
      <AlertDialogTitle>Leave without casting Lumos?</AlertDialogTitle>
      <AlertDialogDescription>Your unfinished incantations will be lost.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Stay</AlertDialogCancel>
      <AlertDialogAction color='critical'>Disapparate</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={['small', 'medium'] as const}>
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
  // `medium` widens at 660 px and up, so on a narrow canvas both sizes are the `small` width: `medium` is
  // never narrower than `small`, and `small` never exceeds the medium container (20rem; less on a narrower viewport).
  play: async ({ canvasElement }) => {
    const width = async (size: string) => {
      await userEvent.click(
        within(cellOf(canvasElement, 'size', size)).getByRole('button', { name: size })
      )
      const dialog = await screen.findByRole('alertdialog')
      const { width: boxWidth } = dialog.getBoundingClientRect()
      await userEvent.keyboard('{Escape}')
      await untilClosed()
      return boxWidth
    }
    const small = await width('small')
    await expect(small).toBeLessThanOrEqual(320)
    await expect(await width('medium')).toBeGreaterThanOrEqual(small)
  }
}

/** The action takes the Button `variant`; each look differs from the others. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AlertDialog>
  <AlertDialogTrigger render={<Button variant='outline' />}>faded</AlertDialogTrigger>
  <AlertDialogContent size='small'>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm faded?</AlertDialogTitle>
      <AlertDialogDescription>The action below takes the faded look.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant='faded'>Proceed faded</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<AlertDialog>
  <AlertDialogTrigger render={<Button variant='outline' />}>critical</AlertDialogTrigger>
  <AlertDialogContent size='small'>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm critical?</AlertDialogTitle>
      <AlertDialogDescription>The action below takes the critical look.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction color='critical'>Proceed critical</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
      }
    }
  },
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
      <AlertDialogContent size='small'>
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

export const Destructive: StoryObj<{ latency: number }> = {
  args: { latency: 1500 },
  parameters: {
    docs: {
      source: {
        code: `const [open, setOpen] = useState(false)
const [deleting, setDeleting] = useState(false)

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger render={<Button color='critical' />}>Close the Gringotts vault</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Close your vault?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        color='critical'
        loading={deleting}
        onClick={(event) => {
          // Keep the dialog open until the work is done.
          event.preventBaseUIHandler()
          closeVault().then(() => setOpen(false))
        }}
      >
        Close the vault
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
      }
    }
  },
  render: ({ latency }) => {
    const [open, setOpen] = React.useState(false)
    const [deleting, setDeleting] = React.useState(false)

    async function handleDelete() {
      setDeleting(true)
      await deleteAccount(latency)
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

    const dialog = screen.getByRole('alertdialog')
    const action = within(dialog).getByRole('button', { name: 'Close the vault' })

    await userEvent.click(action)

    // The action stays open and busy, under its own name, while the promise runs.
    await expect(action).toHaveAttribute('aria-busy', 'true')
    await expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()

    // Resolving the action closes the dialog.
    await untilClosed()
  }
}

const overlays = ['plain', 'blurred'] as const

/** `blurredOverlay` blurs the page behind the backdrop by one unit step. */
export const Overlays: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AlertDialog>
  <AlertDialogTrigger render={<Button variant='outline' />}>Open blurred</AlertDialogTrigger>
  <AlertDialogContent size='small' blurredOverlay>
    <AlertDialogHeader>
      <AlertDialogTitle>Overlay blurred</AlertDialogTitle>
      <AlertDialogDescription>The castle fades behind the portrait.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
      }
    }
  },
  render: () => (
    <Axis axis='overlay' rows={overlays}>
      {(overlay) => (
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant='outline' />}
          >{`Open ${overlay}`}</AlertDialogTrigger>
          <AlertDialogContent size='small' blurredOverlay={overlay === 'blurred'}>
            <AlertDialogHeader>
              <AlertDialogTitle>{`Overlay ${overlay}`}</AlertDialogTitle>
              <AlertDialogDescription>The castle fades behind the portrait.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
      const dialog = await screen.findByRole('alertdialog', { name: `Overlay ${overlay}` })
      filters.push(getComputedStyle(backdropOf(dialog)).backdropFilter)
      await userEvent.keyboard('{Escape}')
      await untilClosed()
    }
    await expect(filters).toEqual(['none', 'blur(4px)'])
  }
}

function Seal({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <AlertDialog defaultOpen={defaultOpen}>
      <AlertDialogTrigger render={<Button variant='outline' />}>
        Seal the cryptex
      </AlertDialogTrigger>
      <AlertDialogContent size='small'>
        <AlertDialogHeader>
          <AlertDialogTitle>Seal the cryptex?</AlertDialogTitle>
          <AlertDialogDescription>
            The Priory&apos;s secret will be lost forever.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Walk away</AlertDialogCancel>
          <AlertDialogAction color='critical'>Seal it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// The a11y gate runs after `play`, when a dialog a play opened has closed again: this story keeps
// the popup and its backdrop open so the gate checks them.
const warnings = [
  'The Room of Requirement holds every object a student has ever hidden there.',
  'Vanishing a cabinet does not return what was inside it.',
  'The Ministry keeps no copy of what is vanished at Hogwarts.',
  'A door that is vanished will not appear again for the same wizard.',
  'Fiendfyre cannot be called off once the room is emptied.',
  'Every cursed object kept there is released into the corridor at once.',
  'Peeves will be told, and he will tell the whole school before supper.',
  'The house-elves who tend the room are not asked whether they agree.',
  'Nothing vanished here can be returned to its owner, whoever that was.'
]

/** In a window shorter than the alert dialog, it scrolls as a whole: its title and its actions can both be reached. */
export const ShortWindow: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AlertDialog>
  <AlertDialogTrigger render={<Button variant='outline' />}>Vanish the room</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Vanish the room?</AlertDialogTitle>
      <AlertDialogDescription>…</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep it</AlertDialogCancel>
      <AlertDialogAction color='critical'>Vanish</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
      }
    }
  },
  name: 'Short window',
  globals: { viewport: { value: 'short', isRotated: false } },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant='outline' />}>Vanish the room</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vanish the room?</AlertDialogTitle>
          <AlertDialogDescription>{warnings.join(' ')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction color='critical'>Vanish</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    await expect(window.innerHeight).toBe(320)
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Vanish the room' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Vanish the room?' })
    await expect(dialog.getBoundingClientRect().height).toBeGreaterThan(window.innerHeight)
    await expectScrollsIntoView(screen.getByRole('button', { name: 'Vanish' }), 'end')
    await expectScrollsIntoView(screen.getByText('Vanish the room?'), 'start')
    await userEvent.keyboard('{Escape}')
    await untilGone(() => screen.queryByRole('alertdialog'))
  }
}

export const Open: Story = {
  render: () => <Seal defaultOpen />,
  play: async () => {
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Seal the cryptex?'
    })
    await waitFor(() => expect(dialog).toBeVisible())
    await expect(dialog).toHaveAccessibleDescription("The Priory's secret will be lost forever.")
  }
}

const openedInKeyboard = () => screen.getByRole('alertdialog', { name: 'Seal the cryptex?' })

/** Enter or Space opens the dialog, Tab stays inside it, Escape closes it, and Enter on a button answers it. */
export const Keyboard: Story = {
  render: () => <Seal />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Seal the cryptex' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await pressUntil('{Enter}', openedInKeyboard, {
      when: () => !screen.queryByRole('alertdialog')
    })
    const dialog = openedInKeyboard()

    // Focus lands on the first button, and Tab keeps it inside (five presses outrun the two buttons).
    await waitFor(() => expect(screen.getByRole('button', { name: 'Walk away' })).toHaveFocus())
    for (let step = 0; step < 5; step += 1) {
      await userEvent.tab()
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    }
    await expect(screen.queryByRole('button', { name: 'Seal the cryptex' })).toBeNull()

    await pressUntil('{Escape}', () => expect(screen.queryByRole('alertdialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    // Space opens it too; Enter on a button closes it and returns focus to the trigger.
    await pressUntil(' ', openedInKeyboard, { when: () => !screen.queryByRole('alertdialog') })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Walk away' })).toHaveFocus())
    // One press: the control that takes it already holds focus (asserted above), and a second press
    // could land on the trigger as focus returns to it and reopen the popup. The popup stays in the
    // page for its exit animation, so the wait is longer on a loaded runner.
    await userEvent.keyboard('{Enter}')
    await untilClosed()
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
