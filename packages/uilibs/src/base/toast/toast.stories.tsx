import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { pressUntil } from '../../contracts/keyboard'
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

function save(latency: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, latency))
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
type PlaygroundArgs = Pick<ComponentProps<typeof ToastProvider>, 'timeout' | 'limit'> &
  Pick<ComponentProps<typeof Toaster>, 'swipeDirection'> & {
    title: string
    description: string
    color: ToastColor
  }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: ['title', 'description', 'color', 'timeout', 'limit', 'swipeDirection']
    }
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    color: { control: 'radio', options: ['neutral', 'primary', 'positive', 'warning', 'critical'] },
    timeout: { control: 'number' },
    limit: { control: 'number' },
    swipeDirection: { control: 'select', options: ['up', 'down', 'left', 'right'] }
  },
  args: {
    title: 'Scheduled: Hogsmeade trip',
    description: 'Departure from Platform 9¾ at 11:00 AM',
    color: 'neutral',
    timeout: 5000,
    limit: 3,
    swipeDirection: 'down'
  },
  render: ({ title, description, color, timeout, limit, swipeDirection }) => (
    <ToastProvider timeout={timeout} limit={limit}>
      <Button variant='outline' onClick={() => toast(title, { description, color })}>
        Show Ministry notice
      </Button>
      <Toaster swipeDirection={swipeDirection} />
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

export const ToastPromise: StoryObj<{ latency: number }> = {
  args: { latency: 2000 },
  name: 'Promise',
  render: ({ latency }) => (
    <ToastProvider>
      <Button
        variant='outline'
        onClick={() => {
          void toast.promise(save(latency), {
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
  parameters: {
    docs: {
      source: {
        code: `<ToastProvider>
  <Button onClick={() => toast.success('Vault updated at Gringotts')}>Success</Button>
  <Button onClick={() => toast.error('Alohomora failed', { description: 'The door is still locked.' })}>
    Error
  </Button>
  <Toaster />
</ToastProvider>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<ToastProvider>
  <Button
    onClick={() =>
      toast('Howler silenced', {
        actionProps: { children: 'Rewind', onClick: () => toast('Howler restored') }
      })
    }
  >
    Silence a Howler
  </Button>
  <Toaster />
</ToastProvider>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<ToastProvider>
  <Button onClick={() => toast("Owl delivered to the Headmaster's tower")}>Show owl delivery</Button>
  <Toaster style={…} />
</ToastProvider>`
      }
    }
  },
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
  parameters: {
    docs: {
      source: {
        code: `<ToastProvider>
  <Button onClick={() => toast('Owl post: critical', { color: 'critical', timeout: 0 })}>
    critical
  </Button>
  <Toaster />
</ToastProvider>`
      }
    }
  },
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

function Notice() {
  return (
    <ToastProvider>
      <Button
        variant='outline'
        onClick={() => toast('Owl delivered', { description: 'From Hogwarts', timeout: 0 })}
      >
        Send an owl
      </Button>
      <Toaster />
    </ToastProvider>
  )
}

// A toast has no open-at-rest prop (it is raised by calling `toast`), so this story raises one that
// does not time out. The a11y gate runs after `play`, so it reads the toast left on screen.
export const Open: Story = {
  render: () => <Notice />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send an owl' }))
    const toastRoot = (await within(document.body).findByText('Owl delivered')).closest(
      '[role="dialog"]'
    )
    await waitFor(() => expect(toastRoot).toBeVisible())
    await expect(toastRoot).toHaveAccessibleName('Owl delivered')
  }
}

/** F6 moves focus to the toasts, Tab reaches a toast, and Escape closes the focused toast. */
export const Keyboard: Story = {
  render: () => <Notice />,
  play: async ({ canvas }) => {
    const body = within(document.body)
    const trigger = canvas.getByRole('button', { name: 'Send an owl' })
    const title = () => body.queryByText('Owl delivered')

    await userEvent.click(trigger)
    await waitFor(() => expect(title()).toBeVisible())
    const toastRoot = title()?.closest('[role="dialog"]')
    if (!(toastRoot instanceof HTMLElement)) throw new Error('Toast root not found')

    const region = () => body.getByRole('region', { name: 'Notifications' })

    // F6 moves focus from anywhere to the toast region.
    await pressUntil('{F6}', () => expect(region()).toHaveFocus())

    // Tab from the region reaches the toast, and the next Tab its close button.
    await pressUntil('{Tab}', () => expect(toastRoot).toHaveFocus(), {
      when: () => document.activeElement === region()
    })
    await pressUntil('{Tab}', () => expect(toastRoot.querySelector('button')).toHaveFocus(), {
      when: () => document.activeElement === toastRoot
    })

    // Escape closes the toast that holds focus, and focus returns to where it was.
    await pressUntil('{Escape}', () => expect(title()).toBeNull(), { when: () => !!title() })
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
