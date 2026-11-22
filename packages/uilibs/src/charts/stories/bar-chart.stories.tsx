import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { barY, defineChart, fold, group, ruleX, ruleY } from '@tanstack/charts'
import { barX } from '@tanstack/charts/bar'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { expect, waitFor } from 'storybook/test'
import { cellOf } from '../../contracts/control-sizes'
import { Axis } from '../../contracts/story-axes'
import { colors } from '../../styles/colors.stylex'
import { Chart, ChartContainer, ChartLegend } from '../chart.component'
import {
  barHoverStates,
  barMotion,
  barRadius,
  canvasDecorator,
  chartTheme,
  checkouts,
  checkoutConfig,
  checkoutScales,
  hpBooks,
  langdonNovels,
  seriesColors
} from '../chart.samples'

const meta = {
  title: 'Visualizations/BarChart',
  component: undefined,
  tags: [], // ['autodocs']
  decorators: [canvasDecorator]
} satisfies Meta

type Story = StoryObj<typeof meta>

export default meta

// Tooltip labels for the internal channels; the portal keeps the surface
// visible inside clipped containers.
const verticalItems = [
  { channel: 'x', label: 'Novel' },
  { channel: 'y', label: 'Chapters' }
] as const
const horizontalItems = [
  { channel: 'x', label: 'Pages' },
  { channel: 'y', label: 'Book' }
] as const

function VerticalBars() {
  const definition = defineChart({
    marks: [
      barY(langdonNovels, {
        id: 'langdon',
        x: 'title',
        y: 'chapters',
        fill: seriesColors.langdon,
        radius: barRadius,
        states: barHoverStates()
      }),
      // Bars can only round all four corners — an opaque baseline rule
      // covers the bottom rounding so only the tips read as rounded.
      ruleY([0], { stroke: colors.backgroundPage, strokeWidth: 6 })
    ],
    scales: checkoutScales,
    theme: chartTheme,
    motion: barMotion,
    focus: 'nearest',
    tooltip: { use: tooltip, portal, items: verticalItems }
  })

  return (
    <ChartContainer config={checkoutConfig}>
      <Chart definition={definition} ariaLabel='Chapters per Robert Langdon novel' height={260} />
      <ChartLegend hide={['potter']} />
    </ChartContainer>
  )
}

export const Playground: Story = {
  render: () => <VerticalBars />,
  play: async ({ canvas }) => {
    const chart = canvas.getByRole('img', { name: 'Chapters per Robert Langdon novel' })
    await expect(chart).toBeVisible()
    await expect(chart.querySelectorAll('rect').length).toBeGreaterThanOrEqual(langdonNovels.length)
    await expect(canvas.queryByText('Harry Potter')).toBeNull()
  }
}

function HorizontalBars() {
  const definition = defineChart({
    marks: [
      barX(hpBooks, {
        id: 'pages',
        x: 'pages',
        y: 'title',
        fill: seriesColors.brand,
        radius: barRadius,
        states: barHoverStates()
      }),
      // Covers the left rounding so bars meet the baseline squarely.
      ruleX([0], { stroke: colors.backgroundPage, strokeWidth: 6 })
    ],
    scales: {
      x: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Pages' } },
      y: { scale: () => scaleBand().padding(0.2) }
    },
    motion: barMotion,
    theme: chartTheme,
    focus: 'nearest',
    tooltip: { use: tooltip, portal, items: horizontalItems }
  })

  return (
    <ChartContainer config={{ pages: { label: 'Pages', color: seriesColors.brand } }}>
      <Chart definition={definition} ariaLabel='Harry Potter books by page count' height={300} />
    </ChartContainer>
  )
}

function StackedBars() {
  // Rounded stack tips without junction notches: the top series paints
  // first with all-corner rounding, then the square bottom series paints
  // over it and hides the rounded lower corners. The overlap is invisible,
  // so the visible junction stays at the true cumulative value.
  const overlap = 24 // data units — clears the 4px radius at every plot height
  const definition = defineChart({
    marks: [
      barY(checkouts, {
        id: 'stacked-potter',
        x: 'month',
        y1: (d) => d.langdon - overlap,
        y2: (d) => d.langdon + d.potter,
        z: () => 'Harry Potter',
        fill: seriesColors.potter,
        radius: barRadius,
        states: barHoverStates()
      }),
      barY(checkouts, {
        id: 'stacked-langdon',
        x: 'month',
        y: 'langdon',
        z: () => 'Robert Langdon',
        fill: seriesColors.langdon,
        states: barHoverStates()
      })
    ],
    scales: checkoutScales,
    motion: barMotion,
    color: {
      domain: ['Robert Langdon', 'Harry Potter'],
      range: [seriesColors.langdon, seriesColors.potter]
    },
    theme: chartTheme,
    focus: 'nearest',
    tooltip: { use: tooltip, portal, items: [{ channel: 'y', label: 'Checkouts' }] as const }
  })

  return (
    <ChartContainer config={checkoutConfig}>
      <Chart definition={definition} ariaLabel='Monthly checkouts stacked by series' height={260} />
      <ChartLegend />
    </ChartContainer>
  )
}

function GroupedBars() {
  // Rename folded series keys to their display labels so focus state,
  // tooltips, and the color scale all speak the same names.
  const rows = fold(checkouts, {
    fields: ['langdon', 'potter'],
    as: { key: 'series', value: 'checkouts' }
  }).map((row) => ({ ...row, series: checkoutConfig[row.series]?.label ?? row.series }))
  const definition = defineChart({
    marks: [
      barY(rows, {
        id: 'grouped-bars',
        x: 'month',
        y: 'checkouts',
        z: 'series',
        color: 'series',
        layout: group(),
        radius: barRadius,
        states: barHoverStates()
      }),
      ruleY([0], { stroke: colors.backgroundPage, strokeWidth: 6 })
    ],
    motion: barMotion,
    scales: checkoutScales,
    color: {
      domain: ['Robert Langdon', 'Harry Potter'],
      range: [seriesColors.langdon, seriesColors.potter]
    },
    theme: chartTheme,
    focus: 'nearest',
    tooltip: { use: tooltip, portal, items: [{ channel: 'y', label: 'Checkouts' }] as const }
  })

  return (
    <ChartContainer config={checkoutConfig}>
      <Chart definition={definition} ariaLabel='Monthly checkouts grouped by series' height={260} />
      <ChartLegend />
    </ChartContainer>
  )
}

const rectCount = (cell: HTMLElement) => cell.querySelectorAll('rect').length

/** The same bars drawn up from the baseline or across from it. */
export const Orientations: Story = {
  render: () => (
    <Axis axis='orientation' rows={['vertical', 'horizontal'] as const} wide>
      {(orientation) => (orientation === 'vertical' ? <VerticalBars /> : <HorizontalBars />)}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    const vertical = cellOf(canvasElement, 'orientation', 'vertical')
    const horizontal = cellOf(canvasElement, 'orientation', 'horizontal')
    await expect(vertical.querySelector('[role="img"]')).toBeVisible()
    await expect(horizontal.querySelector('[role="img"]')).toBeVisible()
    await expect(rectCount(vertical)).toBeGreaterThanOrEqual(langdonNovels.length)
    await expect(rectCount(horizontal)).toBeGreaterThanOrEqual(hpBooks.length)
  }
}

/** Two series piled into one bar per month, or set side by side. */
export const Layouts: Story = {
  render: () => (
    <Axis axis='layout' rows={['stacked', 'grouped'] as const} wide>
      {(layout) => (layout === 'stacked' ? <StackedBars /> : <GroupedBars />)}
    </Axis>
  ),
  play: async ({ canvasElement }) => {
    for (const layout of ['stacked', 'grouped']) {
      const cell = cellOf(canvasElement, 'layout', layout)
      await expect(cell.querySelector('[role="img"]')).toBeVisible()
      await expect(rectCount(cell)).toBeGreaterThanOrEqual(checkouts.length * 2)
    }
    // Stacked bars share the month's slot: grouped ones are narrower.
    // The bars animate in from zero width, so wait until both are measurable.
    const barWidth = (layout: string) =>
      cellOf(canvasElement, 'layout', layout).querySelector('rect')?.getBoundingClientRect()
        .width ?? 0
    await waitFor(async () => {
      await expect(barWidth('stacked')).toBeGreaterThan(0)
      await expect(barWidth('grouped')).toBeGreaterThan(0)
    })
    await expect(barWidth('grouped')).toBeLessThan(barWidth('stacked'))
  }
}
