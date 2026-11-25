import { Activity, Zap } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { Icon } from './icon.component'
import { iconColors } from './icon.stylex'

const meta = {
  title: 'Extra Components/Icon',
  component: Icon,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Icon>

type Story = StoryObj<typeof meta>

// Feather-style raw svg (from the Reshaped docs) — fill/stroke via currentColor.
function MicSvg() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      strokeWidth='2'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    >
      <path d='M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' fill='currentColor' />
      <path d='M19 10v2a7 7 0 0 1-14 0v-2' />
      <line x1='12' x2='12' y1='19' y2='22' />
    </svg>
  )
}

const styles = stylex.create({
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  // Visualize the square bounding box vs the svg asset width.
  boxed: {
    backgroundColor: colors.backgroundNeutralFaded,
    color: colors.foregroundCritical,
    display: 'flex',
    gap: 8
  },
  inherit: {
    color: colors.foregroundPositive
  },
  sized: {
    height: 48,
    width: 48
  }
})

export default meta

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['size', 'color', 'autoWidth'] } },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 4 } },
    autoWidth: { control: 'boolean' },
    color: { control: 'select', options: Object.keys(iconColors) }
  },
  args: { svg: Activity, size: 20, autoWidth: false },
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      <Icon {...args} svg={Activity} />
      <Icon {...args} svg={Zap} />
      <Icon {...args} svg={MicSvg} />
    </div>
  )
}

const sizeNames = ['12', '16', '20', '24', '32'] as const

export const Sizes: Story = {
  parameters: { docs: { source: { code: `<Icon svg={Activity} size={32} />` } } },
  args: { svg: Activity },
  render: () => (
    <Axis axis='size' rows={sizeNames}>
      {(size) => (
        // In a row, as icons sit in a layout: a stretching column would override the square.
        <div {...stylex.props(styles.row)}>
          <Icon svg={Activity} size={Number(size)} />
        </div>
      )}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const size of sizeNames) {
      const svg = cellOf(canvasElement, 'size', size).querySelector('svg')
      if (!svg) throw new Error(`No svg for size ${size}`)
      const box = svg.getBoundingClientRect()
      await expect([box.width, box.height]).toEqual([Number(size), Number(size)])
    }
  }
}

/** Without a number, the icon follows the font size; a literal value fills the parent box. */
export const FluidSize: Story = {
  parameters: {
    docs: {
      source: {
        code: `<span style={{ fontSize: 24 }}>
  <Icon svg={Activity} />
</span>

<div style={{ width: 40, height: 40 }}>
  <Icon svg={Activity} size='100%' />
</div>`
      }
    }
  },
  name: 'Fluid size',
  args: { svg: Activity },
  render: () => (
    <div {...stylex.props(styles.row)}>
      <span {...stylex.props(atoms.fontSize['12px'])}>
        <Icon svg={Activity} />
      </span>
      <span {...stylex.props(atoms.fontSize['24px'])}>
        <Icon svg={Activity} />
      </span>
      <div {...stylex.props(styles.sized)}>
        <Icon svg={Activity} size='100%' />
      </div>
      <div {...stylex.props(styles.sized)}>
        <Icon svg={MicSvg} size='100%' />
      </div>
    </div>
  )
}

const colorNames = [
  'neutral',
  'neutral-faded',
  'primary',
  'positive',
  'warning',
  'critical',
  'disabled'
] as const

export const Colors: Story = {
  parameters: { docs: { source: { code: `<Icon svg={Zap} color='critical' size={20} />` } } },
  args: { svg: Zap },
  render: () => (
    <Axis axis='color' rows={colorNames}>
      {(color) => <Icon svg={Zap} color={color} size={20} />}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const tints = colorNames.map(
      (color) =>
        getComputedStyle(cellOf(canvasElement, 'color', color).firstElementChild ?? canvasElement)
          .color
    )
    await expect(new Set(tints).size).toBe(colorNames.length)
  }
}

/** Without a color, the icon inherits the text color around it. */
export const InheritsColor: Story = {
  name: 'Inherits color',
  args: { svg: Zap },
  render: () => (
    <div data-testid='inherit' {...stylex.props(styles.inherit)}>
      <Icon svg={Zap} size={20} data-testid='inherited' />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('inherited')).color).toBe(
      getComputedStyle(canvas.getByTestId('inherit')).color
    )
  }
}

export const AutoWidth: Story = {
  name: 'autoWidth',
  args: { svg: MicSvg },
  render: () => (
    <div {...stylex.props(styles.column)}>
      {/* Square bounding box keeps wide and narrow icons visually aligned */}
      <div {...stylex.props(styles.boxed)}>
        <Icon svg={MicSvg} size={24} />
        <Icon svg={Zap} size={24} />
        <Icon svg={MicSvg} size={24} />
      </div>
      <div {...stylex.props(styles.boxed)}>
        <Icon svg={MicSvg} autoWidth size={24} />
        <Icon svg={Zap} autoWidth size={24} />
        <Icon svg={MicSvg} autoWidth size={24} />
      </div>
    </div>
  )
}

export const Attributes: Story = {
  name: 'attributes, test: forwarded props',
  args: { svg: Zap },
  render: () => (
    <div data-testid='root'>
      <Icon svg={Zap} size={20} id='test-id' data-testid='icon' />
    </div>
  ),
  play: async ({ canvas }) => {
    const root = canvas.getByTestId('icon')
    await expect(root).toHaveAttribute('id', 'test-id')
  }
}

export const Render: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Icon
  render={<a href='https://reshaped.so' target='_blank' rel='noreferrer' aria-label='Reshaped' />}
  svg={Zap}
  size={20}
/>`
      }
    }
  },
  name: 'render',
  args: { svg: Zap },
  render: () => (
    <Icon
      render={
        <a href='https://reshaped.so' target='_blank' rel='noreferrer' aria-label='Reshaped' />
      }
      svg={Zap}
      size={20}
    />
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Reshaped' })
    await expect(link.querySelector('svg')).toBeInTheDocument()
  }
}

export const ScreenReader: Story = {
  name: 'test: hidden from screen readers',
  args: { svg: Zap },
  render: () => (
    <div data-testid='root'>
      <Icon svg={Zap} size={20} data-testid='icon' />
    </div>
  ),
  play: async ({ canvas }) => {
    const root = canvas.getByTestId('icon')
    await expect(root).toBeInTheDocument()
    await expect(root).toHaveAttribute('aria-hidden', 'true')
  }
}
