import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../base/dialog'
import { Input } from '../../base/input'
import { backdropOf, cellOf, expectDockedTo, expectTypeRole } from '../../contracts/control-sizes'
import { pressUntil } from '../../contracts/keyboard'
import { expectScrollsIntoView, untilGone } from '../../contracts/overlay'
import { Axis } from '../../contracts/story-axes'
import { useIsMobile } from '../../hooks/use-media-query'
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
  component: Sheet
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
    controls: {
      disable: false,
      include: ['side', 'blurredOverlay', 'showCloseButton', 'modal', 'disablePointerDismissal']
    },
    docs: {
      source: {
        code: `<Sheet>
  <SheetTrigger render={<Button variant='outline' />}>Alohomora</SheetTrigger>
  <SheetContent side='right'>
    <SheetHeader>
      <SheetTitle>Edit vault record</SheetTitle>
      <SheetDescription>Make changes to the vault holder here.</SheetDescription>
    </SheetHeader>
    <Label>
      Account holder <Input defaultValue='Luna Lovegood' />
    </Label>
    <SheetFooter>
      <SheetClose render={<Button />}>Save vault record</SheetClose>
      <SheetClose render={<Button variant='outline' />}>Close</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`
      }
    }
  },
  argTypes: {
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    blurredOverlay: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
    modal: { control: 'radio', options: [true, false, 'trap-focus'] },
    disablePointerDismissal: { control: 'boolean' }
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
    await userEvent.click(canvas.getByRole('button', { name: 'Alohomora' }))
    const sheet = await screen.findByRole('dialog')
    await expect(screen.getByRole('heading', { name: 'Edit vault record' })).toBeInTheDocument()
    await expectTypeRole(screen.getByRole('heading', { name: 'Edit vault record' }), 'body1')
    await expect(within(sheet).getByDisplayValue('Luna Lovegood')).toBeInTheDocument()

    // Footer close action dismisses the sheet.
    await userEvent.click(within(sheet).getByRole('button', { name: 'Save vault record' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }
}

export const CloseButton: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Sheet>
  <SheetTrigger render={<Button variant='outline' />}>Open the ledger</SheetTrigger>
  <SheetContent labels={{ close: 'Shut the ledger' }}>
    <SheetHeader>
      <SheetTitle>Vault ledger</SheetTitle>
      <SheetDescription>Every withdrawal since 1991.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`
      }
    }
  },
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
    await userEvent.click(canvas.getByRole('button', { name: 'Open the ledger' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Shut the ledger' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }
}

export const Sides: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Sheet>
  <SheetTrigger render={<Button variant='outline' />}>left</SheetTrigger>
  <SheetContent side='left'>
    <SheetHeader>
      <SheetTitle>Entrance on the left</SheetTitle>
      <SheetDescription>A hidden passage opens on the left side of the castle.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`
      }
    }
  },
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
    for (const side of sides) {
      await userEvent.click(
        within(cellOf(canvasElement, 'side', side)).getByRole('button', { name: side })
      )
      const dialog = await screen.findByRole('dialog')
      await expectDockedTo(dialog, side)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
  }
}

const passages = [
  'The passage behind the tapestry on the fourth floor leads to Honeydukes.',
  'The one-eyed witch opens with a tap of the wand and the word Dissendium.',
  'The Whomping Willow has a knot that freezes its branches when pressed.',
  'The Room of Requirement appears to those who walk past it three times.',
  'The mirror on the seventh floor shows what the heart wants most.',
  'The Chamber of Secrets opens behind a sink that carries a tiny snake.'
]

/** In a window shorter than the sheet, the sheet scrolls as a whole on every side: its title and its footer can both be reached. */
export const ShortWindow: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Sheet>
  <SheetTrigger render={<Button variant='outline' />}>bottom</SheetTrigger>
  <SheetContent side='bottom'>
    <SheetHeader>
      <SheetTitle>Passages on the bottom</SheetTitle>
    </SheetHeader>
    {passages.map((passage) => <p key={passage}>{passage}</p>)}
    <SheetFooter>
      <SheetClose render={<Button />}>Done</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`
      }
    }
  },
  name: 'Short window',
  globals: { viewport: { value: 'short', isRotated: false } },
  render: () => (
    <Axis axis='side' rows={sides}>
      {(side) => (
        <Sheet>
          <SheetTrigger render={<Button variant='outline' />}>{side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Passages on the {side}</SheetTitle>
            </SheetHeader>
            <div {...stylex.props(styles.fields)}>
              {passages.map((passage) => (
                <p key={passage}>{passage}</p>
              ))}
            </div>
            <SheetFooter>
              <SheetClose render={<Button />}>Done</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    await expect(window.innerHeight).toBe(320)
    for (const side of sides) {
      await userEvent.click(
        within(cellOf(canvasElement, 'side', side)).getByRole('button', { name: side })
      )
      const sheet = await screen.findByRole('dialog', { name: `Passages on the ${side}` })
      // The window is shorter than the sheet, or the check below proves nothing.
      await waitFor(() => expect(sheet.scrollHeight).toBeGreaterThan(window.innerHeight))
      const done = screen.getByRole('button', { name: 'Done' })
      await expectScrollsIntoView(done, 'end')
      // The sheet's own box holds its footer: a stretched box would end at the window and leave
      // the footer hanging over the page.
      await expect(sheet.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(
        done.getBoundingClientRect().bottom
      )
      await expectScrollsIntoView(screen.getByText(`Passages on the ${side}`), 'start')
      await userEvent.keyboard('{Escape}')
      await untilGone(() => screen.queryByRole('dialog'))
    }
  }
}

export const NoCloseButton: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Sheet>
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
</Sheet>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<Sheet>
  <SheetTrigger render={<Button variant='outline' />}>Open blurred</SheetTrigger>
  <SheetContent blurredOverlay>
    <SheetHeader>
      <SheetTitle>Overlay blurred</SheetTitle>
      <SheetDescription>The castle fades behind the passage.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`
      }
    }
  },
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
    const filters: string[] = []
    for (const overlay of overlays) {
      await userEvent.click(
        within(cellOf(canvasElement, 'overlay', overlay)).getByRole('button', {
          name: `Open ${overlay}`
        })
      )
      const sheet = await screen.findByRole('dialog', { name: `Overlay ${overlay}` })
      filters.push(getComputedStyle(backdropOf(sheet)).backdropFilter)
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
    await expect(filters).toEqual(['none', 'blur(4px)'])
  }
}

/** One modal for both screens: a Sheet from the bottom edge on a phone, a centered Dialog on a desktop. */
function ResponsiveModal() {
  const isMobile = useIsMobile()
  const title = 'The Pensieve'
  const description = 'Lift a memory from your mind and examine it.'
  return isMobile ? (
    <Sheet>
      <SheetTrigger render={<Button variant='outline' />}>Open the Pensieve</SheetTrigger>
      <SheetContent side='bottom'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog>
      <DialogTrigger render={<Button variant='outline' />}>Open the Pensieve</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

/**
 * `useIsMobile()` picks the modal, so the page ships one trigger. The test browser is a phone-sized
 * window, so this play asserts the Sheet there; the Dialog branch is the same code on a wider window.
 */
export const ResponsiveModalRecipe: Story = {
  parameters: {
    docs: {
      source: {
        code: `function ResponsiveModal() {
  const isMobile = useIsMobile()
  return isMobile ? (
    <Sheet>
      <SheetTrigger render={<Button variant='outline' />}>Open the Pensieve</SheetTrigger>
      <SheetContent side='bottom'>
        <SheetHeader>
          <SheetTitle>The Pensieve</SheetTitle>
          <SheetDescription>Lift a memory from your mind and examine it.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog>
      <DialogTrigger render={<Button variant='outline' />}>Open the Pensieve</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>The Pensieve</DialogTitle>
          <DialogDescription>Lift a memory from your mind and examine it.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}`
      }
    }
  },
  name: 'Sheet on phones, Dialog on desktop',
  render: () => <ResponsiveModal />,
  play: async ({ canvas }) => {
    const phone = window.matchMedia('(max-width: 659px)').matches
    await userEvent.click(canvas.getByRole('button', { name: 'Open the Pensieve' }))
    const dialog = await screen.findByRole('dialog', { name: 'The Pensieve' })
    if (phone) {
      await expectDockedTo(dialog, 'bottom')
    } else {
      // A Dialog floats in the middle of the window, flush with no edge.
      const { top, bottom, left, right } = dialog.getBoundingClientRect()
      await expect(top).toBeGreaterThan(0)
      await expect(bottom).toBeLessThan(window.innerHeight)
      await expect(Math.abs((left + right) / 2 - window.innerWidth / 2)).toBeLessThan(2)
    }
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }
}

function Ledger({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger render={<Button variant='outline' />}>Open the ledger</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Vault ledger</SheetTitle>
          <SheetDescription>Every withdrawal since 1991.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button />}>Sign it</SheetClose>
          <SheetClose render={<Button variant='outline' />}>Walk away</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// The a11y gate runs after `play`, when a sheet a play opened has closed again: this story keeps
// the popup, its backdrop, and its close button open so the gate checks them.
export const Open: Story = {
  render: () => <Ledger defaultOpen />,
  play: async () => {
    const sheet = await screen.findByRole('dialog', { name: 'Vault ledger' })
    await waitFor(() => expect(sheet).toBeVisible())
    await expect(sheet).toHaveAccessibleDescription('Every withdrawal since 1991.')
  }
}

const openedInKeyboard = () => screen.getByRole('dialog', { name: 'Vault ledger' })

/** Enter or Space opens the sheet, Tab stays inside it, and Escape closes it and returns focus. */
export const Keyboard: Story = {
  render: () => <Ledger />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Open the ledger' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await pressUntil('{Enter}', openedInKeyboard, { when: () => !screen.queryByRole('dialog') })
    const sheet = openedInKeyboard()

    // Focus moves into the popup, and Tab keeps it there (five presses outrun its three buttons).
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true))
    for (let step = 0; step < 5; step += 1) {
      await userEvent.tab()
      // Past the last control, focus lands on Base UI's focus guard first and is handed back.
      await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true))
    }
    // The page behind is inert while the sheet is open.
    await expect(screen.queryByRole('button', { name: 'Open the ledger' })).toBeNull()

    await pressUntil('{Escape}', () => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())

    // Space opens it too; focus lands on the first button, and Enter on it closes the sheet.
    await pressUntil(' ', openedInKeyboard, { when: () => !screen.queryByRole('dialog') })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign it' })).toHaveFocus())
    // One press: the control that takes it already holds focus (asserted above), and a second press
    // could land on the trigger as focus returns to it and reopen the popup. The popup stays in the
    // page for its exit animation, so the wait is longer on a loaded runner.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
