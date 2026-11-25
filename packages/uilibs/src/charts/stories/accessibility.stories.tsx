import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { areaY, defineChart, lineY } from '@tanstack/charts'
import { focusGroupX } from '@tanstack/charts/focus'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Button } from '../../base/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../extra/table'
import { unit } from '../../styles/tokens.stylex'
import { Chart, ChartContainer, ChartLegend } from '../chart.component'
import {
  canvasDecorator,
  chartTheme,
  checkoutConfig,
  checkoutScales,
  checkouts,
  seriesColors
} from './chart.samples'

const meta = {
  title: 'Visualizations/Accessibility',
  component: undefined,
  tags: [], // ['autodocs']
  decorators: [canvasDecorator]
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const styles = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: unit.x4, width: '100%' },
  row: { display: 'flex', gap: unit.x3 }
})

const description =
  'Robert Langdon checkouts peak at 305 in February and fall to 173 in April. ' +
  'Harry Potter checkouts rise from 240 in January to 312 in April.'

// One tooltip makes the chart interactive: it is a Tab stop and the arrow keys walk the months.
function CheckoutsChart({ label }: { label: string }) {
  const definition = defineChart({
    marks: [
      lineY(checkouts, {
        id: 'langdon',
        x: 'month',
        y: 'langdon',
        stroke: seriesColors.langdon,
        strokeWidth: 2
      }),
      lineY(checkouts, {
        id: 'potter',
        x: 'month',
        y: 'potter',
        stroke: seriesColors.potter,
        strokeWidth: 2
      })
    ],
    scales: checkoutScales,
    theme: chartTheme,
    focus: focusGroupX,
    tooltip: { use: tooltip, portal, anchor: 'group-center', sort: 'color-domain' }
  })
  return <Chart definition={definition} ariaLabel={label} height={200} idPrefix={label} />
}

// No tooltip: nothing to read at a point, so the chart is not a Tab stop.
function SparkChart({ label }: { label: string }) {
  const definition = defineChart({
    marks: [areaY(checkouts, { x: 'month', y: 'langdon', fill: seriesColors.langdon })],
    scales: checkoutScales,
    theme: chartTheme
  })
  return <Chart definition={definition} ariaLabel={label} height={80} idPrefix={label} />
}

/** `description` on the container becomes the accessible description of every chart inside it. */
export const Description: Story = {
  render: () => (
    <ChartContainer config={checkoutConfig} description={description}>
      <CheckoutsChart label='Monthly checkouts' />
      <ChartLegend />
    </ChartContainer>
  ),
  play: async ({ canvas }) => {
    const chart = canvas.getByRole('img', { name: 'Monthly checkouts' })
    // The svg `<desc>` is the chart image's accessible description.
    await expect(chart.querySelector(':scope > desc')).toHaveTextContent(description)
  }
}

/** Only a chart with a tooltip is a Tab stop, and it draws the library focus ring. */
export const TabOrder: Story = {
  name: 'Tab order',
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Button>Before the charts</Button>
      <ChartContainer config={checkoutConfig}>
        <SparkChart label='Langdon trend, no tooltip' />
      </ChartContainer>
      <ChartContainer config={checkoutConfig}>
        <CheckoutsChart label='Monthly checkouts, with tooltip' />
      </ChartContainer>
      <Button>After the charts</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const before = canvas.getByRole('button', { name: 'Before the charts' })
    const interactive = canvas.getByRole('img', { name: 'Monthly checkouts, with tooltip' })
    const quiet = canvas.getByRole('img', { name: 'Langdon trend, no tooltip' })

    await expect(quiet).toHaveAttribute('tabindex', '-1')
    await expect(interactive).toHaveAttribute('tabindex', '0')

    before.focus()
    // The chart without a tooltip is skipped: the first Tab lands on the interactive chart.
    await userEvent.tab()
    await expect(interactive).toHaveFocus()
    // The ring is drawn on the chart host around the svg, and the svg's own default ring is off.
    const ring = getComputedStyle(interactive.closest('.ts-chart-host') ?? interactive)
    await expect(getComputedStyle(interactive).outlineStyle).toBe('none')
    await expect(ring.outlineStyle).toBe('solid')
    await expect(ring.outlineWidth).toBe('2px')

    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'After the charts' })).toHaveFocus()
    // The tooltip fades out after the chart loses focus, and axe runs when the play ends: wait
    // until it is hidden, or axe measures its half-faded text (WebKit is slow enough to show it).
    await waitFor(() =>
      expect(document.querySelector('.ts-chart-tooltip')).toHaveAttribute('hidden')
    )
  }
}

/** The values for a screen reader: the same rows as the chart, in a `Table` captioned after it. */
export const AsTable: Story = {
  name: 'As a table',
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <ChartContainer config={checkoutConfig}>
        <CheckoutsChart label='Monthly checkouts chart' />
        <ChartLegend />
      </ChartContainer>
      <Table>
        <TableCaption>Monthly checkouts, the data behind the chart</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead>{checkoutConfig.langdon.label}</TableHead>
            <TableHead>{checkoutConfig.potter.label}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checkouts.map((row) => (
            <TableRow key={row.month}>
              <TableCell>{row.month}</TableCell>
              <TableCell>{row.langdon}</TableCell>
              <TableCell>{row.potter}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvas }) => {
    const rows = canvas.getAllByRole('row')
    // One header row plus a row for every month the chart draws.
    await expect(rows).toHaveLength(checkouts.length + 1)
    await expect(canvas.getByRole('cell', { name: '305' })).toBeVisible()
  }
}
