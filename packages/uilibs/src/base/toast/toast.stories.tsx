import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../button'
import { toast, ToastProvider, Toaster, useToast } from './toast.component'

const meta = {
  title: 'Base Components/Toast',
  component: ToastProvider,
  parameters: { layout: 'centered' },
  tags: [], // ['autodocs']
  decorators: [
    (Story) => (
      <div
        {...stylex.props(
          atoms.display.flex,
          atoms.justifyContent.center,
          atoms.padding['20px'],
          atoms.minWidth['448px'],
          atoms.width['100%']
        )}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ToastProvider>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  topLeft: {
    bottom: null,
    right: null,
    left: 16,
    top: 16
  }
})

function save() {
  return new Promise<void>((resolve) => setTimeout(resolve, 2000))
}

function DurationButton() {
  const toastApi = useToast()

  return (
    <Button
      variant='outline'
      onClick={() =>
        toastApi.add({
          title: 'Pinned Howler',
          description: 'Howls for 10 seconds.',
          timeout: 10000
        })
      }
    >
      Show pinned Howler
    </Button>
  )
}

export default meta

export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <Button
        variant='outline'
        onClick={() =>
          toast('Scheduled: Hogsmeade trip', {
            description: 'Departure from Platform 9¾ at 11:00 AM'
          })
        }
      >
        Show Ministry notice
      </Button>
      <Toaster />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show Ministry notice' }))
    await waitFor(() =>
      expect(within(document.body).getByText('Scheduled: Hogsmeade trip')).toBeInTheDocument()
    )
    await expect(within(document.body).getByText(/departure from platform 9¾/i)).toBeInTheDocument()
  }
}

export const ToastPromise: Story = {
  name: 'Promise',
  render: () => (
    <ToastProvider>
      <Button
        variant='outline'
        onClick={() => {
          void toast.promise(save(), {
            loading: 'Sealing the cryptex…',
            success: 'Cryptex sealed',
            error: 'The cryptex jammed'
          })
        }}
      >
        Seal the cryptex
      </Button>
      <Toaster />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Seal the cryptex' }))
    await body.findByText('Sealing the cryptex…')

    // The promise resolves into the success toast.
    await waitFor(() => expect(body.getByText('Cryptex sealed')).toBeInTheDocument(), {
      timeout: 4000
    })
  }
}

export const Duration: Story = {
  render: () => (
    <ToastProvider>
      <DurationButton />
      <Toaster />
    </ToastProvider>
  )
}

export const Types: Story = {
  render: () => (
    <ToastProvider>
      <div {...stylex.props(styles.row)}>
        <Button
          variant='outline'
          onClick={() => toast('Spell cast', { description: 'D.A. meeting at 3 PM.' })}
        >
          Default
        </Button>
        <Button variant='outline' onClick={() => toast.success('Vault updated at Gringotts')}>
          Success
        </Button>
        <Button
          variant='outline'
          onClick={() =>
            toast.error('Alohomora failed', { description: 'The door is still locked.' })
          }
        >
          Error
        </Button>
      </div>
      <Toaster />
    </ToastProvider>
  )
}

export const Action: Story = {
  render: () => (
    <ToastProvider>
      <Button
        variant='outline'
        onClick={() =>
          toast('Howler silenced', {
            actionProps: {
              children: 'Rewind',
              onClick: () => toast('Howler restored')
            }
          })
        }
      >
        Silence a Howler
      </Button>
      <Toaster />
    </ToastProvider>
  )
}

export const Position: Story = {
  render: () => (
    <ToastProvider>
      <Button variant='outline' onClick={() => toast("Owl delivered to the Headmaster's tower")}>
        Show owl delivery
      </Button>
      <Toaster style={styles.topLeft} />
    </ToastProvider>
  )
}

const toneNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

export const Tones: Story = {
  render: () => (
    <ToastProvider>
      <div {...stylex.props(styles.row)}>
        {toneNames.map((tone) => (
          <Button
            key={tone}
            variant='outline'
            onClick={() => toast(`Owl post: ${tone}`, { tone, timeout: 0 })}
          >
            {tone}
          </Button>
        ))}
      </div>
      <Toaster />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const edge = async (tone: (typeof toneNames)[number]) => {
      await userEvent.click(canvas.getByRole('button', { name: tone }))
      const title = await body.findByText(`Owl post: ${tone}`)
      const root = title.closest('[role="dialog"]')
      if (!root) throw new Error('Toast root not found')
      const color = getComputedStyle(root).borderTopColor
      toast.close()
      await waitFor(() => expect(body.queryByText(`Owl post: ${tone}`)).toBeNull())
      return color
    }
    // A toned toast has its own accent; the neutral one keeps the quiet edge.
    const neutral = await edge('neutral')
    for (const tone of toneNames.slice(1)) {
      await expect(await edge(tone)).not.toBe(neutral)
    }
  }
}

export const CloseLabel: Story = {
  name: 'Close label',
  render: () => (
    <ToastProvider>
      <Button variant='outline' onClick={() => toast('Howler silenced', { timeout: 0 })}>
        Silence
      </Button>
      <Toaster labels={{ close: 'Dismiss' }} />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Silence' }))
    const body = within(document.body)
    const toastRoot = (await body.findByText('Howler silenced')).closest('[role="dialog"]')
    // Base UI keeps the close button out of the accessibility tree until the stack is focused,
    // so it is found by its attribute, not by role.
    await expect(toastRoot?.querySelector('button')).toHaveAttribute('aria-label', 'Dismiss')
  }
}
