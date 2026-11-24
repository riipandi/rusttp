import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Button } from '../../base/button'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { Badge } from '../badge'
import { Spinner } from './spinner.component'
import { spinnerColors } from './spinner.stylex'

const meta = {
  title: 'Extra Components/Spinner',
  component: Spinner,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Spinner>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  spinnerSm: { height: 12, width: 12 },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: 16
  },
  stack: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  line: {
    alignItems: 'center',
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    gap: 8,
    margin: 0
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['size', 'color'] } },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    color: { control: 'radio', options: ['inherit', ...Object.keys(spinnerColors)] }
  },
  args: { size: 'md', color: 'inherit' },
  render: (args) => (
    <Button disabled>
      <Spinner {...args} /> Divining…
    </Button>
  ),
  // Inside a Button the spinner is decoration: the button keeps its own name and there is no
  // second live region.
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Divining…' })
    await expect(button).toBeDisabled()
    await expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.queryByRole('status')).toBeNull()
  }
}

export const Alone: Story = {
  render: () => <Spinner labels={{ loading: 'Consulting the Marauder’s Map' }} />,
  // On its own it is a polite live region with the given name.
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('status', { name: 'Consulting the Marauder’s Map' })
    ).toBeInTheDocument()
  }
}

export const Sizes: Story = {
  render: () => (
    <Axis axis='size' rows={['sm', 'md', 'lg'] as const}>
      {(size) => <Spinner size={size} labels={{ loading: `Loading ${size}` }} />}
    </Axis>
  ),
  play: async ({ canvas }) => {
    // The glyph spins, and a turned square's bounding box is wider than the square: WebKit has
    // ticked the animation by the time this runs, so read the layout width, not the box.
    const side = (size: string) =>
      Number.parseFloat(
        getComputedStyle(canvas.getByRole('status', { name: `Loading ${size}` })).width
      )
    await expect([side('sm'), side('md'), side('lg')]).toEqual([12, 16, 20])
  }
}

export const Colors: Story = {
  render: () => (
    <Axis axis='color' rows={['inherit', 'primary', 'positive', 'warning', 'critical'] as const}>
      {(color) => <Spinner color={color} labels={{ loading: `Loading ${color}` }} />}
    </Axis>
  ),
  play: async ({ canvas }) => {
    const tint = (color: string) =>
      getComputedStyle(canvas.getByRole('status', { name: `Loading ${color}` })).color
    await expect(
      new Set(['inherit', 'primary', 'positive', 'warning', 'critical'].map(tint)).size
    ).toBe(5)
  }
}

export const Composition: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Badge variant='faded'>
        <Spinner {...stylex.props(styles.spinnerSm)} />
        Brewing
      </Badge>
      <p {...stylex.props(styles.line)}>
        <Spinner />
        Decoding the cryptex…
      </p>
    </div>
  )
}
