import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { container, fontFamily, fontSize } from '../../styles/tokens.stylex'
import { Slider } from './slider.component'

const meta = {
  title: 'Base Components/Slider',
  component: Slider,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Slider>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  root: {
    maxWidth: container.small
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: 16,
    width: container.medium
  },
  slider: {
    flex: 1
  },
  value: {
    color: colors.foregroundNeutralFaded,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontVariantNumeric: 'tabular-nums',
    width: 32
  },
  verticalRow: {
    height: 160,
    display: 'flex',
    alignItems: 'center'
  }
})

export default meta

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['min', 'max', 'step', 'orientation', 'disabled'] }
  },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' }
  },
  args: {
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
    orientation: 'horizontal',
    disabled: false,
    'aria-label': 'Volume'
  },
  render: (args) => <Slider {...args} style={styles.root} />,
  play: async ({ canvas }) => {
    // Base UI exposes more than one slider element; pick the value thumb.
    const thumbs = canvas.getAllByRole('slider')
    const thumb = thumbs.find((el) => el.getAttribute('aria-valuenow') === '50') ?? thumbs[0]
    if (!thumb) throw new Error('Slider thumb not found')
    await expect(thumb).toHaveAttribute('aria-valuenow', '50')

    // Arrow keys step the value.
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}')
    await expect(thumb).toHaveAttribute('aria-valuenow', '51')

    // Home/End jump to the extremes.
    await userEvent.keyboard('{Home}')
    await expect(thumb).toHaveAttribute('aria-valuenow', '0')
  }
}

export const Orientations: Story = {
  render: () => (
    <Axis axis='orientation' rows={['horizontal', 'vertical'] as const}>
      {(orientation) => (
        <div {...stylex.props(orientation === 'vertical' && styles.verticalRow)}>
          <Slider
            orientation={orientation}
            defaultValue={[40]}
            aria-label={`Volume ${orientation}`}
          />
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const orientation of ['horizontal', 'vertical']) {
      const root = cellOf(canvasElement, 'orientation', orientation).querySelector(
        `[data-orientation="${orientation}"]`
      )
      if (!root) throw new Error(`No ${orientation} slider`)
      const { width, height } = root.getBoundingClientRect()
      await expect(width > height).toBe(orientation === 'horizontal')
    }
  }
}

export const States: Story = {
  render: () => (
    <Axis axis='state' rows={['default', 'disabled'] as const}>
      {(state) => (
        <Slider
          defaultValue={[40]}
          disabled={state === 'disabled'}
          aria-label={`Volume ${state}`}
          style={styles.root}
        />
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    // A disabled slider is drawn with the disabled tokens, so nothing in it is dimmed by opacity.
    const disabledParts = Array.from(
      cellOf(canvasElement, 'state', 'disabled').querySelectorAll('[data-disabled]')
    )
    await expect(disabledParts.length).toBeGreaterThan(0)
    for (const part of disabledParts) await expect(getComputedStyle(part).opacity).toBe('1')
    await expect(
      cellOf(canvasElement, 'state', 'default').querySelector('[data-disabled]')
    ).toBeNull()
  }
}

export const Range: Story = {
  args: { defaultValue: [25, 75], thumbLabels: ['Minimum price', 'Maximum price'] },
  render: (args) => <Slider {...args} style={styles.root} />,
  play: async ({ canvas }) => {
    const min = canvas.getByRole('slider', { name: 'Minimum price' })
    const max = canvas.getByRole('slider', { name: 'Maximum price' })
    await expect(min).toHaveAttribute('aria-valuenow', '25')
    await expect(max).toHaveAttribute('aria-valuenow', '75')
  }
}

export const Controlled: Story = {
  args: { value: [40] },
  render: () => {
    const [value, setValue] = React.useState([40])

    return (
      <div {...stylex.props(styles.row)}>
        <Slider
          aria-label='Volume'
          value={value}
          onValueChange={(next) => setValue(typeof next === 'number' ? [next] : [...next])}
          style={styles.slider}
        />
        <span {...stylex.props(styles.value)}>{value[0]}</span>
      </div>
    )
  }
}
