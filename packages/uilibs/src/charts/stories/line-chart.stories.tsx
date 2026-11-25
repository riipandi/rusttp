import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { crosshair, defineChart, lineY } from '@tanstack/charts'
import { focusGroupX } from '@tanstack/charts/focus'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { expect } from 'storybook/test'
import { UIProvider } from '../../base/provider'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { Chart, ChartContainer, ChartLegend } from '../chart.component'
import {
  canvasDecorator,
  chartMotion,
  chartTheme,
  checkouts,
  checkoutConfig,
  checkoutScales,
  seriesColors
} from './chart.samples'

const meta = {
  title: 'Visualizations/LineChart',
  component: undefined,
  tags: [], // ['autodocs']
  decorators: [canvasDecorator]
} satisfies Meta

type Story = StoryObj<typeof meta>

export default meta

// Grouped x-focus: hovering shows every series at the nearest band plus a
// labeled vertical crosshair guide, so the tooltip rows compare series
// directly. The portal keeps the tooltip visible inside clipped containers.
const interaction = {
  focus: focusGroupX,
  marks: [crosshair({ x: { label: true }, y: false, marker: true })]
}

const groupedTooltipOptions = {
  use: tooltip,
  portal,
  anchor: 'group-center',
  placement: ['top', 'right', 'left', 'bottom'],
  sort: 'color-domain'
} as const

interface LineOptions {
  points?: boolean
  legend?: boolean
  langdon?: boolean
  potter?: boolean
}

function MultipleLines({
  points = false,
  legend = true,
  langdon = true,
  potter = true
}: LineOptions) {
  const definition = defineChart({
    marks: [
      ...(langdon
        ? [
            lineY(checkouts, {
              id: 'Robert Langdon',
              x: 'month',
              y: 'langdon',
              stroke: seriesColors.langdon,
              strokeWidth: 2,
              points
            })
          ]
        : []),
      ...(potter
        ? [
            lineY(checkouts, {
              id: 'Harry Potter',
              x: 'month',
              y: 'potter',
              stroke: seriesColors.potter,
              strokeWidth: 2,
              points
            })
          ]
        : []),
      ...interaction.marks
    ],
    scales: checkoutScales,
    theme: chartTheme,
    motion: chartMotion,
    focus: interaction.focus,
    tooltip: groupedTooltipOptions
  })

  return (
    <ChartContainer config={checkoutConfig}>
      <Chart definition={definition} ariaLabel='Monthly checkouts trend' height={260} />
      {legend && (
        <ChartLegend
          hide={Object.entries({ langdon, potter }).flatMap(([key, on]) => (on ? [] : [key]))}
        />
      )}
    </ChartContainer>
  )
}

type PlaygroundArgs = Required<LineOptions>

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['points', 'legend', 'langdon', 'potter'] } },
  argTypes: {
    points: { control: 'boolean' },
    legend: { control: 'boolean' },
    langdon: { control: 'boolean' },
    potter: { control: 'boolean' }
  },
  args: { points: false, legend: true, langdon: true, potter: true },
  render: (args) => <MultipleLines {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Monthly checkouts trend' })).toBeVisible()
    await expect(canvas.getByText('Robert Langdon')).toBeVisible()
    await expect(canvas.getByText('Harry Potter')).toBeVisible()
  }
}

function DotLines() {
  const definition = defineChart({
    marks: [
      lineY(checkouts, {
        id: 'Robert Langdon',
        x: 'month',
        y: 'langdon',
        stroke: seriesColors.langdon,
        strokeWidth: 2,
        points: true
      }),
      lineY(checkouts, {
        id: 'Harry Potter',
        x: 'month',
        y: 'potter',
        stroke: seriesColors.potter,
        strokeWidth: 2,
        points: true
      }),
      ...interaction.marks
    ],
    scales: checkoutScales,
    theme: chartTheme,
    motion: chartMotion,
    focus: interaction.focus,
    tooltip: groupedTooltipOptions
  })

  return (
    <ChartContainer config={checkoutConfig}>
      <Chart
        definition={definition}
        ariaLabel='Monthly checkouts trend with markers'
        height={260}
      />
      <ChartLegend />
    </ChartContainer>
  )
}

/** The line alone, or with a marker on every datum (`points`). */
export const Variants: Story = {
  render: () => (
    <Axis axis='variant' rows={['line', 'dots'] as const} wide>
      {(variant) => (variant === 'line' ? <MultipleLines /> : <DotLines />)}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const dots = (variant: string) =>
      cellOf(canvasElement, 'variant', variant).querySelectorAll('[role="img"] circle').length
    // One dot per datum per series; the plain line draws none.
    await expect(dots('dots')).toBeGreaterThanOrEqual(checkouts.length * 2)
    await expect(dots('line')).toBeLessThan(dots('dots'))
  }
}

// RTL smoke check: the chart renders inside Base UI's DirectionProvider with
// the right-to-left direction, and pointer inspection keeps working.
export const Rtl: Story = {
  name: 'RTL smoke',
  render: () => {
    const definition = defineChart({
      marks: [
        lineY(checkouts, {
          id: 'langdon',
          x: 'month',
          y: 'langdon',
          stroke: seriesColors.langdon,
          strokeWidth: 2
        })
      ],
      scales: checkoutScales,
      theme: chartTheme,
      tooltip
    })

    return (
      <UIProvider direction='rtl'>
        <ChartContainer config={checkoutConfig}>
          <Chart definition={definition} ariaLabel='Monthly checkouts trend (RTL)' height={260} />
        </ChartContainer>
      </UIProvider>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Monthly checkouts trend (RTL)' })).toBeVisible()
  }
}
