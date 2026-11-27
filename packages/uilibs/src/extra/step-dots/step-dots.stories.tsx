import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '../../base/button'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { radius, unit } from '../../styles/tokens.stylex'
import { Carousel } from '../carousel'
import { StepDots } from './step-dots.component'

const meta = {
  title: 'Extra Components/StepDots',
  component: StepDots
} satisfies Meta<typeof StepDots>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  stack: { alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: unit.x4 },
  row: { alignItems: 'center', display: 'flex', gap: unit.x2 },
  backdrop: {
    backgroundColor: fixedColors.black,
    borderRadius: radius.large,
    padding: unit.x4
  },
  slide: {
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.large,
    boxSizing: 'border-box',
    color: colors.foregroundNeutral,
    padding: unit.x4
  }
})

export default meta

/** The dots of the bar, in order. */
// The engine spells a translucent color `rgba(…, 0.5)` or `color(srgb … / 0.5)`: read the alpha.
const alphaOf = (color: string) => Number(/[,/]\s*([\d.]+)\)$/.exec(color)?.[1] ?? 1)

const dotsOf = (bar: Element) => Array.from(bar.firstElementChild?.children ?? [])

const widthOf = (dot: Element) => dot.getBoundingClientRect().width

export const Playground: Story = {
  parameters: { controls: { disable: false, include: ['total', 'activeIndex', 'size', 'color'] } },
  argTypes: {
    total: { control: { type: 'number', min: 1, max: 30 } },
    activeIndex: { control: { type: 'number', min: 0, max: 29 } },
    size: { control: 'radio', options: ['small', 'medium'] },
    color: { control: 'select', options: ['neutral', 'primary', 'positive', 'warning', 'critical'] }
  },
  args: { total: 5, activeIndex: 2, size: 'medium', color: 'primary' },
  render: (args) => <StepDots {...args} />,
  // A progressbar whose value is the one-based position, named and spoken for assistive technology.
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Progress' })
    await expect(bar).toHaveAttribute('aria-valuemin', '1')
    await expect(bar).toHaveAttribute('aria-valuemax', '5')
    await expect(bar).toHaveAttribute('aria-valuenow', '3')
    await expect(bar).toHaveAttribute('aria-valuetext', '3 of 5')
    await expect(dotsOf(bar)).toHaveLength(5)
  }
}

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StepDots total={5} activeIndex={1} size='small' aria-label='small' />`
      }
    }
  },
  args: { total: 5 },
  render: () => (
    <Axis axis='size' rows={['small', 'medium'] as const}>
      {(size) => <StepDots total={5} activeIndex={1} size={size} aria-label={size} />}
    </Axis>
  ),
  // A dot is 6px or 8px and the active one is stretched to a pill of 16px or 24px.
  play: async ({ canvasElement }) => {
    for (const [size, dot, pill] of [
      ['small', 6, 16],
      ['medium', 8, 24]
    ] as const) {
      const dots = dotsOf(cellOf(canvasElement, 'size', size).firstElementChild!)
      await expect(widthOf(dots[0]!)).toBe(dot)
      await expect(dots[0]!.getBoundingClientRect().height).toBe(dot)
      await expect(widthOf(dots[1]!)).toBe(pill)
    }
  }
}

export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StepDots total={4} activeIndex={1} color='positive' aria-label='positive' />`
      }
    }
  },
  args: { total: 5 },
  render: () => (
    <Axis axis='color' rows={['neutral', 'primary', 'positive', 'warning', 'critical'] as const}>
      {(color) => <StepDots total={4} activeIndex={1} color={color} aria-label={color} />}
    </Axis>
  ),
  // The active dot takes the fill `Progress` draws for the role; the others stay the track color.
  play: async ({ canvasElement }) => {
    const fills = new Set<string>()
    const idle = new Set<string>()
    for (const color of ['neutral', 'primary', 'positive', 'warning', 'critical']) {
      const dots = dotsOf(cellOf(canvasElement, 'color', color).firstElementChild!)
      fills.add(getComputedStyle(dots[1]!).backgroundColor)
      idle.add(getComputedStyle(dots[0]!).backgroundColor)
    }
    await expect(fills.size).toBe(5)
    await expect(idle.size).toBe(1)
  }
}

export const Media: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StepDots total={4} activeIndex={1} color='media' aria-label='On a dark surface' />`
      }
    }
  },
  args: { total: 5 },
  render: () => (
    <div {...stylex.props(styles.backdrop)}>
      <StepDots total={4} activeIndex={1} color='media' aria-label='On a dark surface' />
    </div>
  ),
  // White on a dark surface: the active dot is opaque and the rest are half as strong.
  play: async ({ canvas }) => {
    const dots = dotsOf(canvas.getByRole('progressbar'))
    await expect(alphaOf(getComputedStyle(dots[1]!).backgroundColor)).toBe(1)
    await expect(alphaOf(getComputedStyle(dots[0]!).backgroundColor)).toBe(0.5)
  }
}

export const Windowed: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StepDots total={20} activeIndex={index} aria-label='Horcruxes found' />`
      }
    }
  },
  args: { total: 5 },
  render: () => {
    const [index, setIndex] = React.useState(0)
    return (
      <div {...stylex.props(styles.stack)}>
        <StepDots total={20} activeIndex={index} aria-label='Horcruxes found' />
        <div {...stylex.props(styles.row)}>
          <Button
            size='small'
            variant='outline'
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          >
            Back
          </Button>
          <Button
            size='small'
            variant='outline'
            onClick={() => setIndex((i) => Math.min(i + 1, 19))}
          >
            Next
          </Button>
        </div>
      </div>
    )
  },
  // A row of more than seven dots shows seven and slides to keep the active one in view; the
  // value still counts from the first dot.
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Horcruxes found' })
    const track = bar.firstElementChild
    if (!track) throw new Error('No dots rendered')
    await expect(dotsOf(bar)).toHaveLength(20)
    await expect(bar.getBoundingClientRect().width).toBeLessThan(
      track.getBoundingClientRect().width
    )
    const next = canvas.getByRole('button', { name: 'Next' })
    for (let i = 0; i < 12; i++) await userEvent.click(next)
    await expect(bar).toHaveAttribute('aria-valuenow', '13')
    await expect(bar).toHaveAttribute('aria-valuetext', '13 of 20')
    // The active dot rests inside the window once the slide has finished.
    await waitFor(() => {
      const dot = dotsOf(bar)[12]!.getBoundingClientRect()
      const window = bar.getBoundingClientRect()
      return Promise.all([
        expect(dot.left).toBeGreaterThanOrEqual(window.left),
        expect(dot.right).toBeLessThanOrEqual(window.right)
      ])
    })
  }
}

export const WithCarousel: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [index, setIndex] = useState(0)

<Carousel aria-label='Spells' onChange={setIndex}>
  {spells.map((name) => (
    <div key={name}>{name}</div>
  ))}
</Carousel>
<StepDots total={spells.length} activeIndex={index} aria-label='Spell position' />`
      }
    }
  },
  args: { total: 5 },
  render: () => {
    const [index, setIndex] = React.useState(0)
    const spells = ['Lumos', 'Accio', 'Protego', 'Alohomora']
    return (
      <div {...stylex.props(styles.stack)}>
        <Carousel aria-label='Spells' onChange={setIndex}>
          {spells.map((name) => (
            <div key={name} {...stylex.props(styles.slide)}>
              {name}
            </div>
          ))}
        </Carousel>
        <StepDots total={spells.length} activeIndex={index} aria-label='Spell position' />
      </div>
    )
  },
  // The indicator only displays: the carousel reports its first visible slide and the dots follow.
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Spell position' })
    await expect(bar).toHaveAttribute('aria-valuenow', '1')
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '2'))
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '3'))
    await expect(within(bar).queryAllByRole('button')).toHaveLength(0)
  }
}

export const Labels: Story = {
  args: { total: 5 },
  render: () => (
    <StepDots
      total={3}
      activeIndex={0}
      labels={{ name: 'Étapes', value: (current, total) => `Étape ${current} sur ${total}` }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Étapes' })).toHaveAttribute(
      'aria-valuetext',
      'Étape 1 sur 3'
    )
  }
}

export const AsElement: Story = {
  args: { total: 5 },
  render: () => <StepDots total={3} activeIndex={2} render={<span />} aria-label='Steps' />,
  // `render` swaps the `div` for a `span`, for a bar inside running text.
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Steps' }).tagName).toBe('SPAN')
  }
}
