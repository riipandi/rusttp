import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { type ComponentProps, useState } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { pressUntil } from '../../contracts/keyboard'
import { Button } from '../button'
import {
  toast,
  ToastProvider,
  Toaster,
  useToast,
  type ToastColor,
  type ToasterPosition
} from './toast.component'

const meta = {
  title: 'Base Components/Toast',
  component: ToastProvider
} satisfies Meta<typeof ToastProvider>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  // The buttons sit mid-page, clear of the toast in every corner.
  stage: {
    alignContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    minHeight: '24rem'
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

const positions: readonly ToasterPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
]

// The text and color are options of the `toast()` call, not props of the provider.
type PlaygroundArgs = Pick<ComponentProps<typeof ToastProvider>, 'timeout' | 'limit'> &
  Pick<ComponentProps<typeof Toaster>, 'position' | 'swipeDirection'> & {
    title: string
    description: string
    color: ToastColor
  }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: ['title', 'description', 'color', 'timeout', 'limit', 'position', 'swipeDirection']
    }
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    color: { control: 'radio', options: ['neutral', 'primary', 'positive', 'warning', 'critical'] },
    timeout: { control: 'number' },
    limit: { control: 'number' },
    position: { control: 'select', options: positions },
    swipeDirection: { control: 'select', options: ['up', 'down', 'left', 'right'] }
  },
  args: {
    title: 'Scheduled: Hogsmeade trip',
    description: 'Departure from Platform 9¾ at 11:00 AM',
    color: 'neutral',
    timeout: 5000,
    limit: 3,
    position: 'bottom-right',
    swipeDirection: 'down'
  },
  render: ({ title, description, color, timeout, limit, position, swipeDirection }) => (
    <ToastProvider timeout={timeout} limit={limit}>
      <Button variant='outline' onClick={() => toast(title, { description, color })}>
        Show Ministry notice
      </Button>
      <Toaster position={position} swipeDirection={swipeDirection} />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show Ministry notice' }))
    await waitFor(() => expect(screen.getByText('Scheduled: Hogsmeade trip')).toBeInTheDocument())
    await expect(screen.getByText(/departure from platform 9¾/i)).toBeInTheDocument()
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
    await userEvent.click(canvas.getByRole('button', { name: 'Seal the cryptex' }))
    const loading = await screen.findByText('Sealing the cryptex…')
    const root = loading.closest('[role="dialog"]')
    if (!(root instanceof HTMLElement)) throw new Error('Toast root not found')

    // Pending: a named spinner stands in the glyph slot, and the text reads as a title.
    const spinner = within(root).getByRole('status', { name: 'Loading' })
    const slot = spinner.parentElement
    if (!slot) throw new Error('Glyph slot not found')
    const pendingWidth = root.getBoundingClientRect().width
    const pending = getComputedStyle(loading)
    const pendingText = { color: pending.color, weight: pending.fontWeight }
    await expect(pendingText.color).toBe(getComputedStyle(root).color)

    // Settled: the same toast keeps its width, the spinner is gone, and the success glyph is in
    // the slot with a fade.
    const sealed = await screen.findByText('Cryptex sealed', {}, { timeout: 4000 })
    // The outcome is the quiet detail again: lighter and fainter than the pending text.
    await expect(getComputedStyle(sealed).color).not.toBe(pendingText.color)
    await expect(Number(getComputedStyle(sealed).fontWeight)).toBeLessThan(
      Number(pendingText.weight)
    )
    await expect(within(root).queryByRole('status', { name: 'Loading' })).toBeNull()
    await expect(root.getBoundingClientRect().width).toBe(pendingWidth)
    const glyph = root.querySelector('svg:not(button svg)')
    await expect(glyph).not.toBeNull()
    const fade = getComputedStyle(glyph!.parentElement!)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await expect(fade.animationName === 'none').toBe(reduce)
    await expect(reducedMotionRules(glyph!.parentElement!).some(none('animationName'))).toBe(true)
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

// One Toaster, moved by the button that raises the toast: a toast is `fixed` to the viewport, so a
// stage around the buttons would change nothing.
function PositionDemo() {
  const [position, setPosition] = useState<ToasterPosition>('bottom-right')
  return (
    <ToastProvider>
      <div {...stylex.props(styles.stage)}>
        {positions.map((name) => (
          <Button
            key={name}
            variant='outline'
            onClick={() => {
              toast.close()
              setPosition(name)
              toast(`Owl delivered to ${name}`, { timeout: 0 })
            }}
          >
            {name}
          </Button>
        ))}
      </div>
      <Toaster position={position} />
    </ToastProvider>
  )
}

export const Position: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ToastProvider>
  <Button onClick={() => toast("Owl delivered to the Headmaster's tower")}>Show owl delivery</Button>
  <Toaster position='top-left' />
</ToastProvider>`
      }
    }
  },
  render: () => <PositionDemo />,
  play: async ({ canvas }) => {
    const inset = 16
    for (const name of positions) {
      await userEvent.click(canvas.getByRole('button', { name }))
      const title = await screen.findByText(`Owl delivered to ${name}`)
      const root = title.closest('[role="dialog"]')
      if (!(root instanceof HTMLElement)) throw new Error('Toast root not found')
      const { clientWidth, clientHeight } = document.documentElement
      // The toast slides in from its edge: wait for it to settle, then read where it rests.
      await waitFor(async () => {
        const box = root.getBoundingClientRect()
        await expect(box.top).toBeGreaterThanOrEqual(0)
        await expect(box.bottom).toBeLessThanOrEqual(clientHeight)
        await expect(box.left).toBeGreaterThanOrEqual(0)
        await expect(box.right).toBeLessThanOrEqual(clientWidth)
        if (name.startsWith('top')) await expect(box.top).toBeCloseTo(inset, 0)
        else await expect(box.bottom).toBeCloseTo(clientHeight - inset, 0)
        if (name.endsWith('left')) await expect(box.left).toBeCloseTo(inset, 0)
        else if (name.endsWith('right')) await expect(box.right).toBeCloseTo(clientWidth - inset, 0)
        else await expect(box.left + box.width / 2).toBeCloseTo(clientWidth / 2, 0)
      })
    }
    // The last toast stays open, as in `Open`: the a11y gate runs after `play` and reads it.
  }
}

/** Every style rule inside a `prefers-reduced-motion` media query that applies to the element. */
function reducedMotionRules(element: Element) {
  const found: CSSStyleRule[] = []
  const walk = (rules: CSSRuleList, reduced: boolean) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (reduced && element.matches(rule.selectorText)) found.push(rule)
      } else if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, reduced || rule.conditionText.includes('prefers-reduced-motion'))
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, reduced)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false)
  return found
}

const none = (property: 'animationName') => (rule: CSSStyleRule) => rule.style[property] === 'none'

const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

// The sRGB bytes of `layers` painted over each other, read back from a canvas: it resolves `oklch()`
// and alpha the way the page does, in every engine.
function paint(...layers: string[]) {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('No canvas context')
  for (const layer of layers) {
    context.fillStyle = layer
    context.fillRect(0, 0, 1, 1)
  }
  return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3))
}

function contrast(foreground: number[], background: number[]) {
  const [fg, bg] = [foreground, background].map((rgb) => {
    const [r = 0, g = 0, b = 0] = rgb.map((v) => {
      const c = v / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  })
  return (Math.max(fg ?? 0, bg ?? 0) + 0.05) / (Math.min(fg ?? 0, bg ?? 0) + 0.05)
}

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
            onClick={() =>
              toast(`Owl post: ${color}`, {
                color,
                description: 'The owl waits by the window.',
                timeout: 0
              })
            }
          >
            {color}
          </Button>
        ))}
      </div>
      <Toaster />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    // A status shows in the edge, the surface tint, the title, and a leading glyph.
    const read = async (color: (typeof colorNames)[number]) => {
      await userEvent.click(canvas.getByRole('button', { name: color }))
      const title = await screen.findByText(`Owl post: ${color}`)
      const description = screen.getByText('The owl waits by the window.')
      const root = title.closest('[role="dialog"]')
      if (!root) throw new Error('Toast root not found')
      const style = getComputedStyle(root)
      const glyph = root.querySelector('svg:not(button svg)')
      const surface = paint(style.backgroundColor)
      const reading = {
        edge: style.borderTopColor,
        surface: style.backgroundColor,
        title: getComputedStyle(title).color,
        glyph: glyph ? getComputedStyle(glyph).color : null,
        titleContrast: contrast(paint(getComputedStyle(title).color), surface),
        descriptionContrast: contrast(paint(getComputedStyle(description).color), surface)
      }
      toast.close()
      await waitFor(() => expect(screen.queryByText(`Owl post: ${color}`)).toBeNull())
      return reading
    }
    const neutral = await read('neutral')
    // The neutral toast is the quiet one: no glyph.
    await expect(neutral.glyph).toBeNull()
    const seen = new Set<string>()
    for (const color of colorNames.slice(1)) {
      const reading = await read(color)
      await expect(reading.edge).not.toBe(neutral.edge)
      await expect(reading.surface).not.toBe(neutral.surface)
      await expect(reading.title).not.toBe(neutral.title)
      // The glyph is in the title's color, and the text keeps its contrast on the tint.
      await expect(reading.glyph).toBe(reading.title)
      await expect(reading.titleContrast).toBeGreaterThanOrEqual(4.5)
      await expect(reading.descriptionContrast).toBeGreaterThanOrEqual(4.5)
      seen.add(`${reading.surface}|${reading.title}`)
    }
    // Four roles, four different tints and title colors.
    await expect(seen.size).toBe(colorNames.length - 1)
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
    const toastRoot = (await screen.findByText('Howler silenced')).closest('[role="dialog"]')
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
    const toastRoot = (await screen.findByText('Owl delivered')).closest('[role="dialog"]')
    await waitFor(() => expect(toastRoot).toBeVisible())
    await expect(toastRoot).toHaveAccessibleName('Owl delivered')
  }
}

const titleInKeyboard = () => screen.queryByText('Owl delivered')
const region = () => screen.getByRole('region', { name: 'Notifications' })

/** F6 moves focus to the toasts, Tab reaches a toast, and Escape closes the focused toast. */
export const Keyboard: Story = {
  render: () => <Notice />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Send an owl' })

    await userEvent.click(trigger)
    await waitFor(() => expect(titleInKeyboard()).toBeVisible())
    const toastRoot = titleInKeyboard()?.closest('[role="dialog"]')
    if (!(toastRoot instanceof HTMLElement)) throw new Error('Toast root not found')

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
    await pressUntil('{Escape}', () => expect(titleInKeyboard()).toBeNull(), {
      when: () => !!titleInKeyboard()
    })
    await waitFor(() => expect(trigger).toHaveFocus())
  }
}
