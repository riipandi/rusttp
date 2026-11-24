import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { defineChart, dot, link } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { expect } from 'storybook/test'
import { Chart, ChartContainer, ChartLegend } from '../chart.component'
import { canvasDecorator, chartTheme, seriesColors } from '../chart.samples'

const meta = {
  title: 'Visualizations/LollipopChart',
  component: undefined,
  tags: [], // ['autodocs']
  decorators: [canvasDecorator]
} satisfies Meta

export default meta

// Ranked lollipop: one stem per spell from zero to its mastery score, with a
// dot at the tip. Ranked descending so the strongest charm reads first.
interface SpellRow {
  spell: string
  mastery: number
  /** Constant stem origin so `link` spans from the axis. */
  start: 0
}

const spells: readonly SpellRow[] = [
  { spell: 'Expelliarmus', mastery: 96, start: 0 },
  { spell: 'Expecto Patronum', mastery: 88, start: 0 },
  { spell: 'Accio', mastery: 81, start: 0 },
  { spell: 'Alohomora', mastery: 74, start: 0 },
  { spell: 'Wingardium Leviosa', mastery: 67, start: 0 },
  { spell: 'Riddikulus', mastery: 52, start: 0 },
  { spell: 'Obliviate', mastery: 41, start: 0 },
  { spell: 'Sectumsempra', mastery: 23, start: 0 }
]

const masteryScales = {
  x: { scale: scaleLinear, nice: true, grid: true },
  y: { scale: () => scaleBand().padding(0.35) }
} as const

interface PlaygroundArgs {
  legend: boolean
}

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: { controls: { disable: false, include: ['legend'] } },
  argTypes: {
    legend: { control: 'boolean' }
  },
  args: { legend: false },
  render: ({ legend }) => {
    const definition = defineChart({
      marks: [
        link(spells, {
          id: 'stem',
          x1: 'start',
          y1: 'spell',
          x2: 'mastery',
          y2: 'spell',
          stroke: seriesColors.neutral,
          strokeWidth: 2
        }),
        dot(spells, {
          id: 'mastery',
          x: 'mastery',
          y: 'spell',
          r: 5,
          fill: seriesColors.langdon,
          states: [
            {
              when: { focus: 'primary' },
              style: { r: 7 },
              transition: { type: 'tween', duration: 150, easing: 'ease-out' }
            }
          ]
        })
      ],
      scales: masteryScales,
      theme: chartTheme,
      focus: 'nearest',
      tooltip: {
        use: tooltip,
        portal,
        items: [{ channel: 'x', label: 'Mastery' }] as const
      }
    })

    return (
      <ChartContainer config={{ mastery: { label: 'Mastery', color: seriesColors.langdon } }}>
        <Chart
          definition={definition}
          ariaLabel='Spell mastery ranked from strongest to weakest'
          height={280}
        />
        {legend && <ChartLegend />}
      </ChartContainer>
    )
  },
  play: async ({ canvas }) => {
    const chart = canvas.getByRole('img', {
      name: 'Spell mastery ranked from strongest to weakest'
    })
    await expect(chart).toBeVisible()
    // One tip dot per spell (crosshair markers may add their own circles).
    await expect(chart.querySelectorAll('circle').length).toBeGreaterThanOrEqual(spells.length)
    await expect(canvas.getByText('Expelliarmus')).toBeVisible()
  }
}
