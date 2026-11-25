import { GripVertical } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import * as stylex from '@stylexjs/stylex'
import { areaY, defineChart, lineY } from '@tanstack/charts'
import { focusGroupX } from '@tanstack/charts/focus'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { Button } from '../base/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../base/tabs'
import { Chart, ChartContainer } from '../charts/chart.component'
import {
  canvasDecorator,
  chartTheme,
  checkoutConfig,
  checkoutScales,
  checkouts,
  seriesColors
} from '../charts/stories/chart.samples'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem
} from '../extra/kanban'
import { Link } from '../extra/link'
import { Sortable, SortableItem, SortableItemHandle } from '../extra/sortable'
import { colors } from '../styles/colors.stylex'
import { container, radius, stroke, unit } from '../styles/tokens.stylex'
import { fontFamily, fontLineHeight, fontSize, fontWeight } from '../styles/tokens.stylex'

const meta = {
  title: 'Contracts/Focus is visible',
  parameters: {
    docs: {
      description: {
        component:
          'Every keyboard stop draws a focus indicator (WCAG 2.4.7). A stop with `outline: none` and no other cue is invisible to a keyboard user.'
      }
    }
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// The rows and the column header mirror the Sortable and Kanban stories, so the ring is judged on a
// real-looking surface: a handle and its label on one line, inside a framed row.
const styles = stylex.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2,
    maxWidth: container.large,
    width: '100%'
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevationBase,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    boxSizing: 'border-box',
    color: colors.foregroundNeutral,
    display: 'flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x3,
    lineHeight: fontLineHeight.body2,
    paddingBlock: unit.x3,
    paddingInline: unit.x3,
    width: '100%'
  },
  columnHeader: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'space-between'
  },
  columnTitle: {
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.semibold,
    lineHeight: fontLineHeight.body2
  },
  paragraph: { margin: 0 },
  buttons: { display: 'flex', flexWrap: 'wrap', gap: unit.x3 },
  tabsFrame: {
    maxWidth: container.large,
    width: '100%'
  }
})

/**
 * What a keyboard user sees on the focused element: an outline or a box shadow. A part whose
 * focused element is not the one that draws the ring (a chart's host, a drop zone) names it as
 * `ringOn`.
 */
async function expectFocusIndicator(element: HTMLElement, ringOn: HTMLElement = element) {
  await expect(element).toHaveFocus()
  const style = getComputedStyle(ringOn)
  const outline = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0
  const shadow = style.boxShadow !== 'none'
  await expect(outline || shadow).toBe(true)
}

/**
 * The library ring itself: a 2 px solid outline (`focusRing.root`), which the browser's default
 * ring is not. A part that drops `focusRing.root` still shows the default on an anchor or a
 * `tabindex` element, so `expectFocusIndicator` cannot tell; this can.
 */
async function expectLibraryRing(element: HTMLElement, ringOn: HTMLElement = element) {
  await expect(element).toHaveFocus()
  const style = getComputedStyle(ringOn)
  await expect(style.outlineStyle).toBe('solid')
  await expect(style.outlineWidth).toBe('2px')
}

/** The control: a Button composes `focusRing.root`, so this must pass. It proves the helper can tell. */
export const ButtonRing: Story = {
  name: 'Button (control)',
  render: () => <Button>Alohomora</Button>,
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('button', { name: 'Alohomora' }))
  }
}

// audit-00002 F-02: the panel is a tab stop, so it draws the ring too.
export const TabsPanel: Story = {
  name: 'Tabs panel',
  render: () => (
    <Tabs defaultValue='account' style={styles.tabsFrame}>
      <TabsList aria-label='Vault settings'>
        <TabsTrigger value='account'>Gringotts Vault</TabsTrigger>
        <TabsTrigger value='keys'>Vault Keys</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>Manage your vault at Gringotts.</TabsContent>
      <TabsContent value='keys'>Count the keys in your vault.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    // The panel is a tab stop (tabindex 0): Tab, then Tab again from the selected tab.
    await userEvent.tab()
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('tabpanel'))
  }
}

// audit-00002 F-03: the handle is the keyboard drag control, so it draws the ring.
export const SortableHandle: Story = {
  name: 'Sortable handle',
  render: () => {
    const [items, setItems] = useState(['Hedwig', 'Crookshanks', 'Scabbers'])
    return (
      <Sortable
        value={items}
        onValueChange={setItems}
        getItemValue={(item) => item}
        style={styles.list}
      >
        {items.map((item) => (
          <SortableItem key={item} value={item}>
            <div {...stylex.props(styles.row)}>
              <SortableItemHandle aria-label={`Move ${item}`}>
                <GripVertical size={16} />
              </SortableItemHandle>
              {item}
            </div>
          </SortableItem>
        ))}
      </Sortable>
    )
  },
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('button', { name: 'Move Hedwig' }))
  }
}

// audit-00002 F-03: the handle is the keyboard drag control, so it draws the ring.
export const KanbanColumnHandleRing: Story = {
  name: 'Kanban column handle',
  render: () => {
    const [value, setValue] = useState<Record<string, string[]>>({
      Todo: ['Brew Polyjuice Potion', 'Decode the Voynich cryptex'],
      Doing: ['Find the Horcrux']
    })
    return (
      <Kanban value={value} onValueChange={setValue} getItemValue={(item) => item}>
        <KanbanBoard>
          {Object.keys(value).map((column) => (
            <KanbanColumn key={column} value={column}>
              <div {...stylex.props(styles.columnHeader)}>
                <span {...stylex.props(styles.columnTitle)}>{column}</span>
                <KanbanColumnHandle aria-label={`Reorder ${column}`}>
                  <GripVertical size={16} />
                </KanbanColumnHandle>
              </div>
              <KanbanColumnContent value={column}>
                {value[column]?.map((task) => (
                  <KanbanItem key={task} value={task}>
                    {task}
                  </KanbanItem>
                ))}
              </KanbanColumnContent>
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </Kanban>
    )
  },
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expectFocusIndicator(canvas.getByRole('button', { name: 'Reorder Todo' }))
  }
}

// Link and a Button rendered as a link are the two ways to draw an anchor, and each composes the
// ring by itself: a Link's `focusRing.root` sits beside its color and underline rules, and a
// Button that renders an `a` keeps the Button's ring.
export const TextLinks: Story = {
  name: 'Link',
  render: () => (
    <p {...stylex.props(styles.paragraph)}>
      <Link href='#marauders-map'>Marauder’s Map</Link>{' '}
      <Link href='#invisibility-cloak' variant='plain'>
        Invisibility Cloak
      </Link>{' '}
      <Link href='#elder-wand' color='inherit'>
        Elder Wand
      </Link>
    </p>
  ),
  play: async ({ canvas }) => {
    // The underline link, the plain link (underlined on hover only), and the one that takes the text color.
    for (const name of ['Marauder’s Map', 'Invisibility Cloak', 'Elder Wand']) {
      await userEvent.tab()
      await expectLibraryRing(canvas.getByRole('link', { name }))
    }
  }
}

export const ButtonAsLink: Story = {
  name: 'Button as a link',
  render: () => (
    <div {...stylex.props(styles.buttons)}>
      <Button render={<a href='#floo-network' />}>Floo Network</Button>
      <Button variant='outline' render={<a href='#portkey' />}>
        Portkey
      </Button>
      <Button variant='ghost' render={<a href='#apparition' />}>
        Apparition
      </Button>
    </div>
  ),
  play: async ({ canvas }) => {
    // Solid, outline, and ghost: the last two have no 3:1 edge at rest, so the ring marks them.
    for (const name of ['Floo Network', 'Portkey', 'Apparition']) {
      await userEvent.tab()
      // A rendered `a` is a link, not a button, and keeps the Button ring.
      await expectLibraryRing(canvas.getByRole('link', { name }))
    }
  }
}

// A chart is a Tab stop only when a tooltip makes it interactive.
// The focused element is the svg; the library ring is drawn on the chart host around it.
function CheckoutsChart({ label }: { label: string }) {
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
    focus: focusGroupX,
    tooltip: { use: tooltip, portal, anchor: 'group-center', sort: 'color-domain' }
  })
  return <Chart definition={definition} ariaLabel={label} height={160} idPrefix={label} />
}

function QuietChart({ label }: { label: string }) {
  const definition = defineChart({
    marks: [areaY(checkouts, { x: 'month', y: 'langdon', fill: seriesColors.langdon })],
    scales: checkoutScales,
    theme: chartTheme
  })
  return <Chart definition={definition} ariaLabel={label} height={60} idPrefix={label} />
}

export const InteractiveChart: Story = {
  name: 'Interactive chart',
  decorators: [canvasDecorator],
  render: () => (
    <div {...stylex.props(styles.list)}>
      <ChartContainer config={checkoutConfig}>
        <QuietChart label='Langdon trend, no tooltip' />
      </ChartContainer>
      <ChartContainer config={checkoutConfig}>
        <CheckoutsChart label='Langdon checkouts, with tooltip' />
      </ChartContainer>
      <Button>After the charts</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const chart = canvas.getByRole('img', { name: 'Langdon checkouts, with tooltip' })
    // The chart without a tooltip is not a stop, so the first Tab lands here.
    await userEvent.tab()
    await expectLibraryRing(chart, chart.closest<HTMLElement>('.ts-chart-host') ?? chart)
    // The svg's own default ring is off: the host draws the one ring.
    await expect(getComputedStyle(chart).outlineStyle).toBe('none')

    // Focus leaves the chart and its tooltip fades out; axe runs when the play ends, so wait until
    // the tooltip is hidden or it measures half-faded text.
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'After the charts' })).toHaveFocus()
    await waitFor(() =>
      expect(document.querySelector('.ts-chart-tooltip')).toHaveAttribute('hidden')
    )
  }
}

// plan-00011 Q33: the board is a named region and not a Tab stop. Its stops are the column handles
// and the items, and each one draws the ring.
export const KanbanBoardStops: Story = {
  name: 'Kanban board',
  render: () => {
    const [value, setValue] = useState<Record<string, string[]>>({
      Todo: ['Brew Polyjuice Potion', 'Decode the Voynich cryptex'],
      Doing: ['Find the Horcrux']
    })
    return (
      <Kanban value={value} onValueChange={setValue} getItemValue={(item) => item}>
        <KanbanBoard>
          {Object.keys(value).map((column) => (
            <KanbanColumn key={column} value={column}>
              <KanbanColumnHandle aria-label={`Reorder ${column}`}>
                <GripVertical size={16} />
              </KanbanColumnHandle>
              <KanbanColumnContent value={column}>
                {value[column]?.map((task) => (
                  <KanbanItem key={task} value={task}>
                    {task}
                  </KanbanItem>
                ))}
              </KanbanColumnContent>
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </Kanban>
    )
  },
  play: async ({ canvas }) => {
    const board = canvas.getByRole('region', { name: 'Kanban board' })
    await expect(board).not.toHaveAttribute('tabindex')

    // Tab walks each column's handle, then its items; the first stop is a handle, not the board.
    const stops = [
      canvas.getByRole('button', { name: 'Reorder Todo' }),
      canvas.getByText('Brew Polyjuice Potion'),
      canvas.getByText('Decode the Voynich cryptex'),
      canvas.getByRole('button', { name: 'Reorder Doing' }),
      canvas.getByText('Find the Horcrux')
    ]
    for (const stop of stops) {
      await userEvent.tab()
      await expectLibraryRing(stop)
    }
  }
}
