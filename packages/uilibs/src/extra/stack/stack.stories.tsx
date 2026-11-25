import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { expect } from 'storybook/test'
import { frameOf, ViewportFrame } from '../../contracts/viewport-frame'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontSize, radius, unit } from '../../styles/tokens.stylex'
import { Stack } from './stack.component'

const meta = {
  title: 'Extra Components/Stack',
  component: Stack,
  tags: [] // ['autodocs']
} satisfies Meta<typeof Stack>

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  tile: {
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    paddingBlock: unit.x2,
    paddingInline: unit.x4
  },
  tall: { paddingBlock: unit.x6 },
  panel: { minHeight: unit.x20 },
  col: { display: 'flex', flexDirection: 'column', gap: unit.x4 }
})

const one = (value: unknown) => (typeof value === 'string' ? value : '')
const flex = (value: string) => ({ start: 'flex-start', end: 'flex-end' })[value] ?? value

const houses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin']

const Tiles = ({ tall = false }: { tall?: boolean }) =>
  houses.map((house, index) => (
    <div key={house} {...stylex.props(styles.tile, tall && index === 1 && styles.tall)}>
      {house}
    </div>
  ))

export default meta

// What the engine reports for a CSS value, read from a probe: Chromium spells `flex-start` as
// `flow-start` in a computed style, so a play compares with the engine's own spelling.
function reported(
  property: 'alignItems' | 'justifyContent',
  value: string,
  doc: Document = document
) {
  const probe = doc.createElement('div')
  probe.style[property] = value
  doc.body.append(probe)
  const computed = doc.defaultView!.getComputedStyle(probe)[property]
  probe.remove()
  return computed
}

export const Playground: Story = {
  parameters: {
    controls: { disable: false, include: ['direction', 'gap', 'align', 'justify', 'wrap'] }
  },
  argTypes: {
    direction: { control: 'radio', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 6, 8] },
    align: { control: 'radio', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'radio',
      options: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly']
    },
    wrap: { control: 'boolean' }
  },
  args: { direction: 'row', gap: 3, align: 'start', justify: 'start', wrap: false },
  render: (args) => (
    <Stack {...args} data-testid='stack' style={styles.panel}>
      <Tiles tall />
    </Stack>
  ),
  play: async ({ canvas, args }) => {
    const stack = getComputedStyle(canvas.getByTestId('stack'))
    await expect(stack.display).toBe('flex')
    await expect(stack.flexDirection).toBe(args.direction)
    await expect(stack.gap).toBe(`${(typeof args.gap === 'number' ? args.gap : 0) * 4}px`)
    await expect(stack.alignItems).toBe(reported('alignItems', flex(one(args.align))))
    await expect(stack.justifyContent).toBe(reported('justifyContent', flex(one(args.justify))))
  }
}

/** A column by default; `direction` sets the main axis. */
export const Direction: Story = {
  render: () => (
    <div {...stylex.props(styles.col)}>
      <Stack data-testid='column' gap={2}>
        <Tiles />
      </Stack>
      <Stack data-testid='row' direction='row' gap={2} wrap>
        <Tiles />
      </Stack>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('column')).flexDirection).toBe('column')
    const row = canvas.getByTestId('row')
    await expect(getComputedStyle(row).flexDirection).toBe('row')
    await expect(getComputedStyle(row).flexWrap).toBe('wrap')
  }
}

/** The gap counts `unit` steps: `3` is 12px, as in Reshaped. */
export const Gap: Story = {
  render: () => (
    <div {...stylex.props(styles.col)}>
      {([0, 1, 3, 6] as const).map((gap) => (
        <Stack key={gap} data-testid={`gap-${gap}`} direction='row' gap={gap} wrap>
          <Tiles />
        </Stack>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const [step, px] of [
      [0, '0px'],
      [1, '4px'],
      [3, '12px'],
      [6, '24px']
    ] as const) {
      await expect(getComputedStyle(canvas.getByTestId(`gap-${step}`)).gap).toBe(px)
    }
  }
}

/** `align` is the cross axis and `justify` the main axis. */
export const Alignment: Story = {
  render: () => (
    <div {...stylex.props(styles.col)}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <Stack
          key={align}
          align={align}
          data-testid={`align-${align}`}
          direction='row'
          gap={2}
          justify={align === 'start' ? 'start' : align === 'center' ? 'center' : 'space-between'}
          style={styles.panel}
        >
          <Tiles tall />
        </Stack>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const centered = getComputedStyle(canvas.getByTestId('align-center'))
    await expect(centered.alignItems).toBe(reported('alignItems', 'center'))
    const ended = getComputedStyle(canvas.getByTestId('align-end'))
    await expect(ended.alignItems).toBe(reported('alignItems', 'flex-end'))
    await expect(ended.justifyContent).toBe(reported('justifyContent', 'space-between'))
  }
}

/**
 * Direction, gap, alignment, and justification take a value per breakpoint. Each frame is a
 * viewport of its own width, so its media queries see that width: 390 px is a phone, 700 px has
 * reached `medium`, 1000 px `large`, and 1300 px `xlarge`.
 */
export const Responsive: Story = {
  render: () => (
    <div {...stylex.props(styles.col)}>
      {[390, 700, 1000, 1300].map((width) => (
        <ViewportFrame
          key={width}
          title={`${width} px viewport`}
          width={width}
          height={width < 660 ? 190 : 80}
        >
          <Stack
            data-testid='stack'
            direction={{ small: 'column', medium: 'row' }}
            gap={{ small: 2, large: 6, xlarge: 2 }}
            align={{ small: 'stretch', medium: 'center' }}
          >
            <Tiles />
          </Stack>
        </ViewportFrame>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Each case is the breakpoint's own style over the narrower ones: `gap` is set at `small` and
    // `large`, so at 700 px it must still be the `small` one, not dropped for lack of a `medium`.
    const cases = [
      { width: 390, direction: 'column', gap: '8px', alignItems: 'stretch' },
      { width: 700, direction: 'row', gap: '8px', alignItems: 'center' },
      { width: 1000, direction: 'row', gap: '24px', alignItems: 'center' },
      { width: 1300, direction: 'row', gap: '8px', alignItems: 'center' }
    ]
    for (const { width, direction, gap, alignItems } of cases) {
      const { doc, computed } = await frameOf(canvasElement, width)
      const stack = computed(doc.querySelector('[data-testid="stack"]')!)
      await expect(stack.flexDirection).toBe(direction)
      await expect(stack.gap).toBe(gap)
      await expect(stack.alignItems).toBe(reported('alignItems', alignItems, doc))
    }
  }
}

/** `render` swaps the element, such as a list that lays out like any other Stack. */
export const Render: Story = {
  render: () => (
    <Stack render={<ul aria-label='Houses' />} data-testid='list' direction='row' gap={2} wrap>
      {houses.map((house) => (
        <li key={house} {...stylex.props(styles.tile)}>
          {house}
        </li>
      ))}
    </Stack>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list', { name: 'Houses' })
    await expect(list.tagName).toBe('UL')
    await expect(getComputedStyle(list).display).toBe('flex')
    await expect(getComputedStyle(list).flexDirection).toBe('row')
  }
}
