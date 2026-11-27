import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { backdropOf, cellOf, expectTypeRole } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { expectScrollsIntoView, untilGone } from '../../contracts/overlay'
import { Axis } from '../../contracts/story-axes'
import { container, fontSize, unit } from '../../styles/tokens.stylex'
import { Button } from '../button'
import { Input } from '../input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog.component'

const meta = {
  title: 'Base Components/Dialog',
  component: Dialog,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Dialog>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  narrow: {
    width: container.medium
  },
  content: {
    maxHeight: 'calc(100dvh - 64px)'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: 12,
    minHeight: 0,
    fontSize: fontSize.body2,
    paddingRight: unit.x4,
    overflowY: 'auto'
  }
})

export default meta

// The look lives on `DialogContent`, so its props reach the story as args beside the root's.
type PlaygroundArgs = ComponentProps<typeof Dialog> &
  Pick<ComponentProps<typeof DialogContent>, 'size' | 'blurredOverlay' | 'showCloseButton'>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: ['size', 'blurredOverlay', 'showCloseButton', 'modal', 'disablePointerDismissal']
    }
  },
  argTypes: {
    size: { control: 'radio', options: ['small', 'medium'] },
    blurredOverlay: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
    modal: { control: 'radio', options: [true, false, 'trap-focus'] },
    disablePointerDismissal: { control: 'boolean' }
  },
  args: { size: 'medium', blurredOverlay: false, showCloseButton: true },
  render: ({ size, blurredOverlay, showCloseButton, ...root }) => (
    <Dialog {...root}>
      <DialogTrigger render={<Button variant='outline' />}>Open the cryptex</DialogTrigger>
      <DialogContent size={size} blurredOverlay={blurredOverlay} showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Erase the map?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The Marauder&apos;s Map and all of its secret passages
            will be permanently wiped.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant='ghost' />}>Cancel</DialogClose>
          <DialogClose render={<Button color='critical' />}>Erase</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open the cryptex' }))
    await screen.findByRole('dialog')
    await expect(screen.getByRole('heading', { name: 'Erase the map?' })).toBeInTheDocument()
    await expectTypeRole(screen.getByRole('heading', { name: 'Erase the map?' }), 'body1')

    // Escape dismisses the dialog.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    // Reopen and confirm with the destructive action.
    await userEvent.click(canvas.getByRole('button', { name: 'Open the cryptex' }))
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Erase' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }
}

export const CloseButton: Story = {
  name: 'Close button',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant='outline' />}>Open the vault</DialogTrigger>
      <DialogContent labels={{ close: 'Seal the vault' }}>
        <DialogHeader>
          <DialogTitle>Gringotts vault 713</DialogTitle>
          <DialogDescription>Only the goblins may enter.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  // The built-in close button is named by `labels` and dismisses the dialog.
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open the vault' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Seal the vault' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }
}

export const Custom: Story = {
  name: 'Custom width',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Rename</DialogTrigger>
      <DialogContent style={styles.narrow}>
        <DialogHeader>
          <DialogTitle>Rename the owl</DialogTitle>
          <DialogDescription>Give your owl a new name.</DialogDescription>
        </DialogHeader>
        <Input defaultValue='Hedwig' />
        <DialogFooter>
          <DialogClose render={<Button variant='ghost' />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Scrollable: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dialog>
  <DialogTrigger render={<Button variant='outline' />}>View the decrees</DialogTrigger>
  <DialogContent style={…}>
    <DialogHeader>
      <DialogTitle>Ministry of Magic Decrees</DialogTitle>
      <DialogDescription>Please read before your first visit to Hogsmeade.</DialogDescription>
    </DialogHeader>
    <div>…</div>
    <DialogFooter>
      <DialogClose render={<Button variant='ghost' />}>Decline</DialogClose>
      <DialogClose render={<Button />}>I solemnly swear</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`
      }
    }
  },
  name: 'Scrollable content',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant='outline' />}>View the decrees</DialogTrigger>
      <DialogContent style={styles.content}>
        <DialogHeader>
          <DialogTitle>Ministry of Magic Decrees</DialogTitle>
          <DialogDescription>
            Last updated February 2026. Please read before your first visit to Hogsmeade.
          </DialogDescription>
        </DialogHeader>
        <div {...stylex.props(styles.body)}>
          <p>
            1. Acceptance of decrees. By setting foot within the castle or its grounds, you agree to
            be bound by these decrees and the decisions of the Headmaster.
          </p>
          <p>
            2. Wand license. Permission is granted to use your wand for study purposes only. This is
            a license granted by the Ministry, not a transfer of magical title.
          </p>
          <p>
            3. Dormitory responsibilities. You are responsible for the confidentiality of your
            common room password and for all magic performed under your house banner.
          </p>
          <p>
            4. Owl delivery. We do not guarantee that owls will be uninterrupted, timely, or dry,
            and the Owlery reserves the right to suspend deliveries in stormy weather.
          </p>
          <p>
            5. Limitation of liability. In no event shall the Ministry be liable for any hexed,
            jinxed, or cursed damages arising from moving staircases or misfired charms.
          </p>
          <p>
            6. Changes to decrees. The Ministry may revise these decrees at any time. By remaining
            at Hogwarts after changes take effect, you agree to the revised decrees.
          </p>
          <p>
            7. Expulsion. We may suspend or expel your attendance at any time, without notice, for
            conduct that violates these decrees.
          </p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant='ghost' />}>Decline</DialogClose>
          <DialogClose render={<Button />}>I solemnly swear</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const owlRules = [
  'Owls deliver post to the address on the envelope and to no other.',
  'A letter for the Headmaster is carried to the Great Hall at breakfast.',
  'Packages heavier than a Quaffle travel by a barn owl in pairs.',
  'An owl that returns with an unopened letter is fed before it is asked anything.',
  'Howlers are delivered at the table where the reader sits.',
  'Replies to the Ministry are written in black ink on one side of the parchment.'
]

/** In a window shorter than the dialog, the dialog scrolls as a whole: its title and its footer can both be reached. */
export const ShortWindow: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dialog>
  <DialogTrigger render={<Button variant='outline' />}>Read the owl rules</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Owl post rules</DialogTitle>
    </DialogHeader>
    {rules.map((rule) => <p key={rule}>{rule}</p>)}
    <DialogFooter>
      <DialogClose render={<Button />}>Understood</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`
      }
    }
  },
  name: 'Short window',
  globals: { viewport: { value: 'short', isRotated: false } },
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant='outline' />}>Read the owl rules</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Owl post rules</DialogTitle>
        </DialogHeader>
        {owlRules.map((rule) => (
          <p key={rule}>{rule}</p>
        ))}
        <DialogFooter>
          <DialogClose render={<Button />}>Understood</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await expect(window.innerHeight).toBe(320)
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Read the owl rules' }))
    const dialog = await screen.findByRole('dialog', { name: 'Owl post rules' })
    // The window is shorter than the dialog, or the check below proves nothing.
    await expect(dialog.getBoundingClientRect().height).toBeGreaterThan(window.innerHeight)
    await expectScrollsIntoView(screen.getByRole('button', { name: 'Understood' }), 'end')
    await expectScrollsIntoView(screen.getByText('Owl post rules'), 'start')
    await userEvent.keyboard('{Escape}')
    await untilGone(() => screen.queryByRole('dialog'))
  }
}

export const NoCloseButton: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dialog>
  <DialogTrigger render={<Button variant='outline' />}>Open the sealed letter</DialogTrigger>
  <DialogContent showCloseButton={false}>
    <DialogHeader>
      <DialogTitle>Confirm your owl address</DialogTitle>
      <DialogDescription>This letter only closes through the buttons below.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose render={<Button variant='ghost' />}>Send an owl later</DialogClose>
      <DialogClose render={<Button />}>Noted</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`
      }
    }
  },
  name: 'No close button',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant='outline' />}>Open the sealed letter</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Confirm your owl address</DialogTitle>
          <DialogDescription>
            We sent an owl to langdon@harvard.edu. This letter only closes through the buttons
            below.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant='ghost' />}>Send an owl later</DialogClose>
          <DialogClose render={<Button />}>Noted</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const sizes = ['small', 'medium'] as const

/** `medium` is the default width (32rem); `small` is the narrower 24rem. */
export const Sizes: Story = {
  // The page shows this usage, not the axis harness that renders every value.
  parameters: {
    docs: {
      source: {
        code: `<Dialog>
  <DialogTrigger render={<Button variant='outline' />}>Open small</DialogTrigger>
  <DialogContent size='small'>
    <DialogHeader>
      <DialogTitle>Dialog small</DialogTitle>
      <DialogDescription>The Room of Requirement fits the occasion.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`
      }
    }
  },
  render: () => (
    <Axis axis='size' rows={sizes}>
      {(size) => (
        <Dialog>
          <DialogTrigger render={<Button variant='outline' />}>{`Open ${size}`}</DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>{`Dialog ${size}`}</DialogTitle>
              <DialogDescription>The Room of Requirement fits the occasion.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const widths: number[] = []
    for (const size of sizes) {
      await userEvent.click(
        within(cellOf(canvasElement, 'size', size)).getByRole('button', { name: `Open ${size}` })
      )
      const dialog = await screen.findByRole('dialog', { name: `Dialog ${size}` })
      // The popup scales in from 0.97, so wait for the full width before reading it.
      await waitFor(() => expect(dialog.getBoundingClientRect().width).toBeGreaterThan(0))
      widths.push(Math.round(parseFloat(getComputedStyle(dialog).width)))
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
    // The popup keeps 16px of room on each side of a narrow viewport.
    const room = window.innerWidth - 32
    await expect(widths).toEqual([Math.min(384, room), Math.min(512, room)])
  }
}

const overlays = ['plain', 'blurred'] as const

/** `blurredOverlay` blurs the page behind the backdrop by one unit step. */
export const Overlays: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dialog>
  <DialogTrigger render={<Button variant='outline' />}>Open blurred</DialogTrigger>
  <DialogContent blurredOverlay>
    <DialogHeader>
      <DialogTitle>Overlay blurred</DialogTitle>
      <DialogDescription>The castle fades behind the portrait.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`
      }
    }
  },
  render: () => (
    <Axis axis='overlay' rows={overlays}>
      {(overlay) => (
        <Dialog>
          <DialogTrigger render={<Button variant='outline' />}>{`Open ${overlay}`}</DialogTrigger>
          <DialogContent blurredOverlay={overlay === 'blurred'}>
            <DialogHeader>
              <DialogTitle>{`Overlay ${overlay}`}</DialogTitle>
              <DialogDescription>The castle fades behind the portrait.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
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
      filters.push(getComputedStyle(backdropOf(dialog)).backdropFilter)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
    await expect(filters).toEqual(['none', 'blur(4px)'])
  }
}

function Cryptex({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger render={<Button variant='outline' />}>Open the cryptex</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter the passphrase</DialogTitle>
          <DialogDescription>Five letters turn the rings of the cryptex.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant='ghost' />}>Walk away</DialogClose>
          <DialogClose render={<Button />}>Turn the rings</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// The a11y gate runs after `play`, when a dialog a play opened has closed again: this story keeps
// the popup, its backdrop, and its close button open so the gate checks them.
export const Open: Story = {
  render: () => <Cryptex defaultOpen />,
  play: async () => {
    const dialog = await screen.findByRole('dialog', {
      name: 'Enter the passphrase'
    })
    await waitFor(() => expect(dialog).toBeVisible())
    await expect(dialog).toHaveAccessibleDescription('Five letters turn the rings of the cryptex.')
  }
}

/** Enter or Space opens the dialog from its trigger, Tab stays inside it, and Escape closes it and returns focus. */
export const Keyboard: Story = {
  render: () => <Cryptex />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Open the cryptex' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    // Enter opens it only while it is closed: once open, focus is inside and Enter would press
    // the focused button.
    await pressUntil(
      '{Enter}',
      () => screen.getByRole('dialog', { name: 'Enter the passphrase' }),
      {
        when: () => !screen.queryByRole('dialog')
      }
    )
    const dialog = screen.getByRole('dialog')

    // Focus moves into the popup, and Tab keeps it there (five presses outrun the three controls, so it wraps).
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    for (let step = 0; step < 5; step += 1) {
      await userEvent.tab()
      // Past the last control, focus lands on Base UI's focus guard first and is handed back to
      // the popup a moment later, so it is read settled.
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    }

    // The page behind is inert: its trigger is out of the accessibility tree while the popup is open.
    await expect(screen.queryByRole('button', { name: 'Open the cryptex' })).toBeNull()

    await pressUntil('{Escape}', () => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    // Space opens it too. Focus lands on the first button, `DialogClose`, and Enter on it closes
    // the dialog; the press repeats only while the dialog is still open, because once it is gone
    // focus is back on the trigger and Enter would reopen it.
    await pressUntil(' ', () => screen.getByRole('dialog', { name: 'Enter the passphrase' }), {
      when: () => !screen.queryByRole('dialog')
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Walk away' })).toHaveFocus())
    await pressUntil('{Enter}', () => expect(screen.queryByRole('dialog')).toBeNull(), {
      when: () => !!screen.queryByRole('dialog')
    })
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
