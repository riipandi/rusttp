import { Check } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect, fn, userEvent } from 'storybook/test'
import { Spinner } from '../spinner'
import { Badge } from './badge.component'

const meta = {
  title: 'Extra Components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['solid', 'faded', 'outline', 'ghost']
    }
  },
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
} satisfies Meta<typeof Badge>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  grid: {
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'repeat(5, max-content)'
  },
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

export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Badge variant='faded'>Hufflepuff</Badge>
      <Badge variant='outline'>Ravenclaw</Badge>
      <Badge color='critical'>Azkaban</Badge>
    </div>
  )
}

const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const
const variantNames = ['solid', 'faded', 'outline', 'ghost'] as const

/** Every variant in every color; the a11y gate checks the contrast of each pair. */
export const Colors: Story = {
  render: () => (
    <div {...stylex.props(styles.grid)}>
      {variantNames.map((variant) =>
        colorNames.map((color) => (
          <Badge key={`${variant}-${color}`} variant={variant} color={color}>
            {`${variant} ${color}`}
          </Badge>
        ))
      )}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const variant of variantNames) {
      for (const color of colorNames) {
        await expect(canvas.getByText(`${variant} ${color}`)).toBeInTheDocument()
      }
    }
  }
}

export const Icon: Story = {
  name: 'With icon',
  render: () => (
    <Badge variant='faded'>
      <Check {...stylex.props(styles.icon)} />
      Ministry approved
    </Badge>
  )
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

export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Badge key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const height = (name: string) => canvas.getByText(name).getBoundingClientRect().height
    await expect(height('sm')).toBeLessThan(height('md'))
    await expect(height('md')).toBeLessThan(height('lg'))
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

export const Dismissible: Story = {
  args: { onDismiss: fn() },
  render: (args) => (
    <Badge variant='faded' onDismiss={args.onDismiss}>
      Detention
    </Badge>
  ),
  play: async ({ args, canvas }) => {
    const dismiss = canvas.getByRole('button', { name: 'Dismiss' })
    await userEvent.click(dismiss)
    await expect(args.onDismiss).toHaveBeenCalledOnce()
  }
}
