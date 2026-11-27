import { Check, ChevronRight } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { expectHitArea } from '../../contracts/hit-area'
import { Axis } from '../../contracts/story-axes'
import { Spinner } from '../spinner'
import { Badge } from './badge.component'
import { badgeSizes, badgeSolidColors, badgeVariants } from './badge.stylex'

const meta = {
  title: 'Extra Components/Badge',
  component: Badge
} satisfies Meta<typeof Badge>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  icon: { height: 14, width: 14 },
  spinner: { height: 12, width: 12 },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  }
})

export default meta

const glyphs = { none: undefined, check: Check, chevron: ChevronRight }

export const Playground: Story = {
  parameters: {
    controls: {
      disable: false,
      include: ['children', 'variant', 'color', 'size', 'rounded', 'highlighted', 'icon', 'endIcon']
    }
  },
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'radio', options: Object.keys(badgeVariants) },
    color: { control: 'radio', options: Object.keys(badgeSolidColors) },
    size: { control: 'radio', options: Object.keys(badgeSizes) },
    rounded: { control: 'boolean' },
    highlighted: { control: 'boolean' },
    // A glyph is a component: the control lists names and `mapping` maps each to its glyph.
    icon: { control: 'select', options: Object.keys(glyphs), mapping: glyphs },
    endIcon: { control: 'select', options: Object.keys(glyphs), mapping: glyphs }
  },
  args: {
    variant: 'solid',
    children: 'Gryffindor',
    rounded: true,
    highlighted: false,
    icon: undefined,
    endIcon: undefined
  },
  render: (args) => <Badge {...args} />
}

const variantNames = ['solid', 'faded', 'outline', 'ghost'] as const
const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

/** The four fills at the default color. */
export const Variants: Story = {
  parameters: { docs: { source: { code: `<Badge variant='faded'>Hufflepuff</Badge>` } } },
  render: () => (
    <Axis axis='variant' rows={variantNames}>
      {(variant) => <Badge variant={variant}>Hufflepuff</Badge>}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const look = (variant: string) => {
      const el = canvasElement.querySelector(`[data-variant="${variant}"]`)?.firstElementChild
      if (!el) throw new Error(`No badge for ${variant}`)
      const style = getComputedStyle(el)
      return `${style.backgroundColor}|${style.color}|${style.borderTopColor}|${style.borderTopWidth}`
    }
    await expect(new Set(variantNames.map(look)).size).toBe(variantNames.length)
  }
}

/** Every fill in every color; the a11y gate checks the contrast of each pair. */
export const Colors: Story = {
  parameters: {
    docs: { source: { code: `<Badge variant='outline' color='critical'>outline critical</Badge>` } }
  },
  render: () => (
    <Axis axis='variant' rows={variantNames} columnAxis='color' columns={colorNames}>
      {(variant, color) => (
        <Badge variant={variant} color={color}>
          {`${variant} ${color}`}
        </Badge>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const look = (variant: string, color: string) => {
      const el = canvasElement.querySelector(
        `[data-variant="${variant}"][data-color="${color}"]`
      )?.firstElementChild
      if (!el) throw new Error(`No badge for ${variant} ${color}`)
      const style = getComputedStyle(el)
      return `${style.backgroundColor}|${style.color}|${style.borderTopColor}`
    }
    // Color and fill are independent: in every fill, no two colors share a look.
    for (const variant of variantNames) {
      await expect(new Set(colorNames.map((color) => look(variant, color))).size).toBe(
        colorNames.length
      )
    }
  }
}

export const Sizes: Story = {
  parameters: { docs: { source: { code: `<Badge size='large'>large</Badge>` } } },
  render: () => (
    <Axis axis='size' rows={['small', 'medium', 'large'] as const}>
      {(size) => <Badge size={size}>{size}</Badge>}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      canvasElement
        .querySelector(`[data-size="${size}"]`)
        ?.firstElementChild?.getBoundingClientRect().height ?? 0
    await expect(height('small')).toBeLessThan(height('medium'))
    await expect(height('medium')).toBeLessThan(height('large'))
  }
}

/** A badge that can be dismissed carries a named button; a highlighted one fades. */
export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Badge variant='faded'>Owl Post</Badge>

<Badge variant='faded' highlighted>Floo Network</Badge>

<Badge variant='faded' onDismiss={() => …}>Detention</Badge>`
      }
    }
  },
  args: { onDismiss: fn() },
  render: (args) => (
    <Axis axis='state' rows={['default', 'highlighted', 'dismissible'] as const}>
      {(state) => (
        <Badge
          variant='faded'
          highlighted={state === 'highlighted'}
          onDismiss={state === 'dismissible' ? args.onDismiss : undefined}
        >
          {{ default: 'Owl Post', highlighted: 'Floo Network', dismissible: 'Detention' }[state]}
        </Badge>
      )}
    </Axis>
  ),
  play: async ({ args, canvas }) => {
    // Highlighted is the same badge, faded.
    await expect(getComputedStyle(canvas.getByText('Floo Network')).opacity).toBe('0.8')
    await expect(getComputedStyle(canvas.getByText('Owl Post')).opacity).toBe('1')

    // Only the dismissible badge has a button (the canvas overlay's own button is not named Dismiss).
    await expect(canvas.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(1)
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }))
    await expect(args.onDismiss).toHaveBeenCalledOnce()
  }
}

export const WithSpinner: Story = {
  name: 'With spinner',
  render: () => (
    <Badge variant='faded'>
      <Spinner {...stylex.props(styles.spinner)} />
      Apparating
    </Badge>
  )
}

export const Link: Story = {
  render: () => (
    <Badge variant='faded' render={<a href='#new-release' />}>
      New at Weasleys'
    </Badge>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: "New at Weasleys'" })
    await expect(link).toHaveAttribute('href', '#new-release')
  }
}

/** The dismiss button is a 24px target at every badge size, though its glyph is 10 to 14px. */
export const DismissTarget: Story = {
  args: { onDismiss: fn() },
  render: (args) => (
    <Axis axis='size' rows={['small', 'medium', 'large'] as const}>
      {(size) => (
        <Badge variant='faded' size={size} onDismiss={args.onDismiss}>
          {size}
        </Badge>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll('[aria-label="Dismiss"]')
    await expect(buttons).toHaveLength(3)
    for (const button of buttons) {
      await expectHitArea(button)
    }
  }
}

export const Squared: Story = {
  render: () => <Badge rounded={false}>Owl Post</Badge>,
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText('Owl Post')).borderTopLeftRadius).toBe('6px')
  }
}

/** A glyph before the label, after it, or both; the dismiss button stays last. */
export const Icons: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Badge icon={Check} color='positive'>
        Ministry approved
      </Badge>
      <Badge endIcon={ChevronRight} variant='outline'>
        Next chapter
      </Badge>
      <Badge endIcon={ChevronRight} variant='faded' onDismiss={() => {}}>
        Triwizard Tournament
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    // The glyphs are decoration, so the name of each badge is its text.
    const approved = canvas.getByText('Ministry approved')
    await expect(approved.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    const next = canvas.getByText('Next chapter')
    await expect(next.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(next.lastElementChild?.tagName.toLowerCase()).toBe('svg')

    // The end glyph sits before the dismiss button.
    const tournament = canvas.getByText('Triwizard Tournament')
    const children = Array.from(tournament.children).map((child) => child.tagName.toLowerCase())
    await expect(children).toEqual(['svg', 'button'])
  }
}

const onDismissKey = fn()

/** The dismiss button is the only Tab stop of a badge; Enter and Space both dismiss. */
export const Keyboard: Story = {
  render: () => (
    <Badge variant='faded' onDismiss={onDismissKey}>
      Detention
    </Badge>
  ),
  play: async ({ canvas }) => {
    onDismissKey.mockClear()
    const dismiss = canvas.getByRole('button', { name: 'Dismiss' })
    await userEvent.tab()
    await waitFor(() => expect(dismiss).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(onDismissKey).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(' ')
    await expect(onDismissKey).toHaveBeenCalledTimes(2)
  }
}
