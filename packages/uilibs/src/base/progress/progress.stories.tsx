import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Button } from '../button'
import { Progress, ProgressLabel, ProgressValue } from './progress.component'
import { progressColors, progressSizes } from './progress.stylex'
const meta = {
  title: 'Base Components/Progress',
  component: Progress,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Progress>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  root: {
    maxWidth: container.small
  },
  wrap: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: container.small
  },
  button: {
    alignSelf: 'flex-start'
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['value', 'min', 'max', 'color', 'size'] } },
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    color: { control: 'select', options: Object.keys(progressColors) },
    size: { control: 'radio', options: Object.keys(progressSizes) }
  },
  args: { value: 66, min: 0, max: 100, color: 'primary', size: 'medium' },
  render: (args) => (
    <Progress {...args} locale='en-US' style={styles.root}>
      <ProgressLabel>Brewing Polyjuice Potion…</ProgressLabel>
      <ProgressValue />
    </Progress>
  )
}

export const Label: Story = {
  args: { value: 72, locale: 'en-US' },
  render: (args) => (
    <Progress {...args} style={styles.root}>
      <ProgressLabel>Gringotts vault capacity used</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('progressbar', { name: 'Gringotts vault capacity used' })
    await expect(el).toHaveAttribute('aria-valuenow', '72')
    await expect(el).toHaveAttribute('aria-valuemax', '100')
  }
}

export const Controlled: Story = {
  args: { value: 20 },
  render: () => {
    const [value, setValue] = React.useState(20)

    return (
      <div {...stylex.props(styles.wrap)}>
        <Progress value={value} locale='en-US' aria-label='Cryptex decryption'>
          <ProgressValue />
        </Progress>
        <Button
          variant='outline'
          size='small'
          onClick={() => setValue((current) => Math.min(current + 20, 100))}
          style={styles.button}
        >
          Decrypt next ring
        </Button>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar')
    await expect(bar).toHaveAttribute('aria-valuenow', '20')

    // Each click advances the controlled value by 20, clamped at 100.
    await userEvent.click(canvas.getByRole('button', { name: 'Decrypt next ring' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Decrypt next ring' }))
    await expect(bar).toHaveAttribute('aria-valuenow', '60')
  }
}

const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

const barParts = (canvasElement: HTMLElement, selector: string) => {
  const root = canvasElement.querySelector(selector)
  const track = root?.firstElementChild
  const indicator = track?.firstElementChild
  if (!track || !indicator) throw new Error(`No progress bar for ${selector}`)
  return { track: getComputedStyle(track), indicator: getComputedStyle(indicator) }
}

export const Colors: Story = {
  args: { value: 60 },
  render: () => (
    <Axis axis='color' rows={colorNames}>
      {(color) => <Progress value={60} color={color} aria-label={`Brewing ${color}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const fills = colorNames.map(
      (color) =>
        barParts(canvasElement, `[data-color="${color}"] [role="progressbar"]`).indicator
          .backgroundColor
    )
    await expect(new Set(fills).size).toBe(5)
  }
}

export const Sizes: Story = {
  args: { value: 60 },
  render: () => (
    <Axis axis='size' rows={['small', 'medium'] as const}>
      {(size) => <Progress value={60} size={size} aria-label={`Brewing ${size}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      barParts(canvasElement, `[data-size="${size}"] [role="progressbar"]`).track.height
    await expect(height('small')).toBe('2px')
    await expect(height('medium')).toBe('4px')
  }
}
