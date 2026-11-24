import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { areaY, defineChart, fold, stack } from '@tanstack/charts'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { expect } from 'storybook/test'
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
} from '../chart.samples'

const meta = {
  title: 'Visualizations/AreaChart',
  component: undefined,
  tags: [], // ['autodocs']
  decorators: [canvasDecorator]
} satisfies Meta

type Story = StoryObj<typeof meta>

export default meta

interface AreaOptions {
  legend?: boolean
  langdon?: boolean
  potter?: boolean
}

function OverlaidAreas({ legend = true, langdon = true, potter = true }: AreaOptions) {
  const definition = defineChart({
    marks: [
      ...(langdon
        ? [
            areaY(checkouts, {
              id: 'langdon',
              x: 'month',
              y: 'langdon',
              fill: seriesColors.langdon,
              fillOpacity: 0.15,
              stroke: seriesColors.langdon,
              strokeWidth: 2,
              states: [
                {
                  when: { focus: 'unmatched' },
                  style: { fillOpacity: 0.08 },
                  transition: { type: 'tween', duration: 150, easing: 'ease-out' }
                }
              ]
            })
          ]
        : []),
      ...(potter
        ? [
            areaY(checkouts, {
              id: 'potter',
              x: 'month',
              y: 'potter',
              fill: seriesColors.potter,
              fillOpacity: 0.15,
              stroke: seriesColors.potter,
              strokeWidth: 2,
              states: [
                {
                  when: { focus: 'unmatched' },
                  style: { fillOpacity: 0.08 },
                  transition: { type: 'tween', duration: 150, easing: 'ease-out' }
                }
              ]
            })
          ]
        : [])
    ],
    scales: checkoutScales,
    theme: chartTheme,
    // Nearest-x focus: the hovered series stays solid while the other fades
    // out via its unmatched state.
    focus: 'nearest-x',
    tooltip
  })

  return (
    <ChartContainer config={checkoutConfig}>
      <Chart definition={definition} ariaLabel='Monthly checkouts by series' height={260} />
      {legend && (
        <ChartLegend
          hide={Object.entries({ langdon, potter }).flatMap(([key, on]) => (on ? [] : [key]))}
        />
      )}
    </ChartContainer>
  )
}

type PlaygroundArgs = Required<AreaOptions> & { layout: 'overlaid' | 'stacked' }

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['layout', 'legend', 'langdon', 'potter'] } },
  argTypes: {
    layout: { control: 'radio', options: ['overlaid', 'stacked'] },
    legend: { control: 'boolean' },
    langdon: { control: 'boolean' },
    potter: { control: 'boolean' }
  },
  args: { layout: 'overlaid', legend: true, langdon: true, potter: true },
  render: ({ layout, ...options }) =>
    layout === 'stacked' ? <StackedAreas {...options} /> : <OverlaidAreas {...options} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Monthly checkouts by series' })).toBeVisible()
    await expect(canvas.getByText('Robert Langdon')).toBeVisible()
    await expect(canvas.getByText('Harry Potter')).toBeVisible()
  }
}

function StackedAreas({ legend = true, langdon = true, potter = true }: AreaOptions) {
  const rows = fold(checkouts, {
    fields: ['langdon', 'potter'],
    as: { key: 'series', value: 'checkouts' }
  }).filter((row) => (row.series === 'langdon' ? langdon : potter))
  const definition = defineChart({
    marks: [
      areaY(rows, {
        id: 'stacked-areas',
        x: 'month',
        y: 'checkouts',
        z: 'series',
        color: 'series',
        fillOpacity: 0.6,
        layout: stack()
      })
    ],
    scales: checkoutScales,
    color: { domain: ['langdon', 'potter'], range: [seriesColors.langdon, seriesColors.potter] },
    theme: chartTheme,
    motion: chartMotion,
    focus: 'group-x',
    tooltip: {
      use: tooltip,
      portal,
      anchor: 'group-center',
      placement: ['top', 'right', 'left', 'bottom'],
      sort: 'color-domain',
      items: [{ channel: 'y', label: 'Checkouts' }] as const
    }
  })

  return (
    <ChartContainer config={checkoutConfig}>
      <Chart definition={definition} ariaLabel='Monthly checkouts stacked by series' height={260} />
      {legend && (
        <ChartLegend
          hide={Object.entries({ langdon, potter }).flatMap(([key, on]) => (on ? [] : [key]))}
        />
      )}
    </ChartContainer>
  )
}

/**
 * Two series drawn over each other, or folded into one tall area with `fold` and stacked with
 * `layout: stack()`; the stacked series color comes from the definition-level color scale.
 */
export const Layouts: Story = {
  render: () => (
    <Axis axis='layout' rows={['overlaid', 'stacked'] as const} wide>
      {(layout) => (layout === 'overlaid' ? <OverlaidAreas /> : <StackedAreas />)}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const layout of ['overlaid', 'stacked']) {
      const cell = cellOf(canvasElement, 'layout', layout)
      await expect(cell.querySelector('[role="img"]')).toBeVisible()
      // One shape per series: area scenes paint as paths.
      await expect(cell.querySelectorAll('[role="img"] path').length).toBeGreaterThanOrEqual(2)
    }
  }
}
