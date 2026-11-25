import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { Axis } from '../../contracts/story-axes'
import { container } from '../../styles/tokens.stylex'
import { Meter, MeterLabel, MeterValue } from './meter.component'
import { meterColors, meterSizes } from './meter.stylex'

const meta = {
  title: 'Base Components/Meter',
  component: Meter,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Meter>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  root: {
    maxWidth: container.small
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['value', 'min', 'max', 'color', 'size'] } },
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    color: { control: 'select', options: Object.keys(meterColors) },
    size: { control: 'radio', options: Object.keys(meterSizes) }
  },
  args: { value: 24, min: 0, max: 64, color: 'primary', size: 'medium', locale: 'en-US' },
  render: (args) => (
    <Meter {...args} style={styles.root}>
      <MeterLabel>Polyjuice Potion brewed</MeterLabel>
      <MeterValue>{(_, value) => `${value} ml of ${args.max} ml`}</MeterValue>
    </Meter>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('meter', { name: 'Polyjuice Potion brewed' })
    await expect(el).toHaveAttribute('aria-valuenow', '24')
    await expect(el).toHaveAttribute('aria-valuemax', '64')
    await expect(canvas.getByText('24 ml of 64 ml')).toBeInTheDocument()
  }
}

export const CustomRange: Story = {
  name: 'Custom range',
  args: { value: 72, min: 30, max: 90, locale: 'en-US' },
  render: (args) => (
    <Meter {...args} style={styles.root}>
      <MeterLabel>Cryptex pressure</MeterLabel>
      <MeterValue>{(_, value) => `${value} psi`}</MeterValue>
    </Meter>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByRole('meter', { name: 'Cryptex pressure' })
    await expect(el).toHaveAttribute('aria-valuemin', '30')
    await expect(el).toHaveAttribute('aria-valuemax', '90')
    await expect(el).toHaveAttribute('aria-valuenow', '72')
    await expect(canvas.getByText('72 psi')).toBeInTheDocument()
  }
}

const colorNames = ['neutral', 'primary', 'positive', 'warning', 'critical'] as const

const barParts = (canvasElement: HTMLElement, selector: string) => {
  const root = canvasElement.querySelector(selector)
  const track = root?.firstElementChild
  const indicator = track?.firstElementChild
  if (!track || !indicator) throw new Error(`No meter for ${selector}`)
  return { track: getComputedStyle(track), indicator: getComputedStyle(indicator) }
}

export const Colors: Story = {
  args: { value: 60 },
  render: () => (
    <Axis axis='color' rows={colorNames}>
      {(color) => <Meter value={60} color={color} aria-label={`Gauge ${color}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const fills = colorNames.map(
      (color) =>
        barParts(canvasElement, `[data-color="${color}"] [role="meter"]`).indicator.backgroundColor
    )
    await expect(new Set(fills).size).toBe(5)
  }
}

export const Sizes: Story = {
  args: { value: 60 },
  render: () => (
    <Axis axis='size' rows={['small', 'medium'] as const}>
      {(size) => <Meter value={60} size={size} aria-label={`Gauge ${size}`} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      barParts(canvasElement, `[data-size="${size}"] [role="meter"]`).track.height
    await expect(height('small')).toBe('2px')
    await expect(height('medium')).toBe('4px')
  }
}
