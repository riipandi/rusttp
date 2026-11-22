import { Check } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect, fn, userEvent } from 'storybook/test'
import { Axis } from '../../contracts/story-axes'
import { Spinner } from '../spinner'
import { Badge } from './badge.component'

const meta = {
  title: 'Extra Components/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'radio', options: ['solid', 'faded', 'outline', 'ghost'] },
    color: {
      control: 'radio',
      options: ['neutral', 'primary', 'positive', 'warning', 'critical']
    },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] }
  },
  tags: [] // ['autodocs']
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

export const Playground: Story = {
  args: { variant: 'solid' },
  render: (args) => <Badge {...args}>Gryffindor</Badge>
}

const variantNames = ['solid', 'faded', 'outline', 'ghost'] as const
const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

/** The four fills at the default color. */
export const Variants: Story = {
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
  render: () => (
    <Axis axis='size' rows={['sm', 'md', 'lg'] as const}>
      {(size) => <Badge size={size}>{size}</Badge>}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      canvasElement
        .querySelector(`[data-size="${size}"]`)
        ?.firstElementChild?.getBoundingClientRect().height ?? 0
    await expect(height('sm')).toBeLessThan(height('md'))
    await expect(height('md')).toBeLessThan(height('lg'))
  }
}

/** A badge that can be dismissed carries a named button. */
export const States: Story = {
  args: { onDismiss: fn() },
  render: (args) => (
    <Axis axis='state' rows={['default', 'dismissible'] as const}>
      {(state) => (
        <Badge variant='faded' onDismiss={state === 'dismissible' ? args.onDismiss : undefined}>
          {state === 'dismissible' ? 'Detention' : 'Owl Post'}
        </Badge>
      )}
    </Axis>
  ),
  play: async ({ args, canvas }) => {
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

export const Squared: Story = {
  render: () => <Badge rounded={false}>Owl Post</Badge>,
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText('Owl Post')).borderTopLeftRadius).toBe('6px')
  }
}

export const WithGlyph: Story = {
  name: 'With glyph prop',
  render: () => (
    <Badge icon={Check} color='positive'>
      Ministry approved
    </Badge>
  )
}
