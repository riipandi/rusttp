import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../button'
import { toast, ToastProvider, Toaster, useToast, type ToastColor } from './toast.component'

const meta = {
  title: 'Base Components/Toast',
  component: ToastProvider,
  tags: [] // ['autodocs']
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

// The text and color are options of the `toast()` call, not props of the provider.
type PlaygroundArgs = Pick<ComponentProps<typeof ToastProvider>, 'timeout'> & {
  title: string
  description: string
  color: ToastColor
}

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { disable: false, include: ['title', 'description', 'color', 'timeout'] }
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    color: { control: 'radio', options: ['neutral', 'primary', 'positive', 'warning', 'critical'] },
    timeout: { control: 'number' }
  },
  args: {
    title: 'Scheduled: Hogsmeade trip',
    description: 'Departure from Platform 9¾ at 11:00 AM',
    color: 'neutral',
    timeout: 5000
  },
  render: ({ title, description, color, timeout }) => (
    <ToastProvider timeout={timeout}>
      <Button variant='outline' onClick={() => toast(title, { description, color })}>
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

const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

export const Colors: Story = {
  render: () => (
    <ToastProvider>
      <div {...stylex.props(styles.row)}>
        {colorNames.map((color) => (
          <Button
            key={color}
            variant='outline'
            onClick={() => toast(`Owl post: ${color}`, { color, timeout: 0 })}
          >
            {color}
          </Button>
        ))}
      </div>
      <Toaster />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    const body = within(document.body)
    const edge = async (color: (typeof colorNames)[number]) => {
      await userEvent.click(canvas.getByRole('button', { name: color }))
      const title = await body.findByText(`Owl post: ${color}`)
      const root = title.closest('[role="dialog"]')
      if (!root) throw new Error('Toast root not found')
      const edgeColor = getComputedStyle(root).borderTopColor
      toast.close()
      await waitFor(() => expect(body.queryByText(`Owl post: ${color}`)).toBeNull())
      return edgeColor
    }
    // A colored toast has its own accent; the neutral one keeps the quiet edge.
    const neutral = await edge('neutral')
    for (const color of colorNames.slice(1)) {
      await expect(await edge(color)).not.toBe(neutral)
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
