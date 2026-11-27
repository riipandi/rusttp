import { RefreshCw } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { useTable } from '@tanstack/react-table'
import type { Column, ColumnDef, SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { DataGrid, DataGridColumnHeader, DataGridContainer, DataGridTableVirtual } from '../'
import { dataGridFeatures } from '../'
import type { DataGridFeatures, DataGridTableInstance } from '../'
import { Avatar, AvatarFallback } from '../../base/avatar'
import { Button } from '../../base/button'
import { pressUntil } from '../../contracts/keyboard'
import { Card, CardContent } from '../../extra/card'
import { colors } from '../../styles/colors.stylex'
import { unit } from '../../styles/tokens.stylex'
import { stackStyles as s } from './_mocks.stylex'

const meta = {
  title: 'Data Grid/Infinite',
  parameters: { layout: 'fullscreen' },
  tags: [], // ['autodocs']
  decorators: [
    (Story) => (
      <div {...stylex.props(atoms.padding['20px'], atoms.width['100%'])}>
        <Story />
      </div>
    )
  ]
} satisfies Meta

/** The args of a story that simulates a backend: how long a page takes to arrive, in ms. */
interface LatencyArgs {
  latency: number
}

type Story = StoryObj<typeof meta>
export default meta

interface IRow {
  id: string
  title: string
  author: string
  status: 'In print' | 'Out of print' | 'Pre-order'
  price: number
}

const infiniteStyles = stylex.create({
  mutedNumeric: {
    color: colors.foregroundNeutralFaded,
    fontVariantNumeric: 'tabular-nums'
  },
  numeric: {
    fontVariantNumeric: 'tabular-nums'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    paddingBlock: unit.x3,
    width: '100%'
  },
  cardOverflow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    overflow: 'hidden',
    paddingBlock: unit.x3
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'space-between',
    paddingBlock: unit.x3,
    paddingInline: unit.x5
  },
  cardBody: { padding: 0 }
})

/**
 * The virtual table manages its own scroll container in standalone mode;
 * a plain div keeps the DataGridContainer width contract without double
 * scroll areas.
 */
function DataGridScrollAreaProxy({ children }: { children: React.ReactNode }) {
  return <div style={{ width: '100%' }}>{children}</div>
}

const TITLES = [
  'Angels & Demons',
  'The Da Vinci Code',
  'The Lost Symbol',
  'Inferno',
  'Origin',
  "Harry Potter and the Philosopher's Stone",
  'Harry Potter and the Chamber of Secrets',
  'Harry Potter and the Prisoner of Azkaban',
  'Harry Potter and the Goblet of Fire',
  'Harry Potter and the Order of the Phoenix'
]

const AUTHORS = ['Dan Brown', 'J.K. Rowling']

function simulateRow(index: number): IRow {
  return {
    id: String(index + 1),
    title: TITLES[index % TITLES.length]!,
    author: AUTHORS[index % 2]!,
    status: (['In print', 'Out of print', 'Pre-order'] as const)[index % 3]!,
    // A fixed spread over 8.00 to 17.99, so every run draws the same grid.
    price: 8 + ((index * 7919) % 1000) / 100
  }
}

function generateData(count: number): IRow[] {
  return Array.from({ length: count }, (_, index) => simulateRow(index))
}

function useColumns(getReactTable: () => DataGridTableInstance<IRow>) {
  return useMemo<ColumnDef<DataGridFeatures, IRow>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader table={getReactTable()} title='#' column={column} />
        ),
        cell: ({ row }) => (
          <span {...stylex.props(infiniteStyles.mutedNumeric)}>{row.original.id}</span>
        ),
        size: 70,
        enableSorting: false
      },
      {
        accessorKey: 'title',
        id: 'title',
        header: ({ column }) => (
          <DataGridColumnHeader table={getReactTable()} title='Title' column={column} />
        ),
        cell: ({ row }) => (
          <div {...stylex.props(s.cellFlexWide)}>
            <Avatar style={s.avatar24}>
              <AvatarFallback>
                {row.original.title
                  .split(' ')
                  .filter(
                    (word) => !['the', 'and', 'of', 'a', 'an', '&'].includes(word.toLowerCase())
                  )
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span {...stylex.props(s.strong)}>{row.original.title}</span>
          </div>
        ),
        minSize: 150,
        meta: { autoSize: true },
        enableSorting: true
      },
      {
        accessorKey: 'author',
        id: 'author',
        header: ({ column }) => (
          <DataGridColumnHeader table={getReactTable()} title='Author' column={column} />
        ),
        size: 200,
        enableSorting: true
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader table={getReactTable()} title='Status' column={column} />
        ),
        size: 120,
        enableSorting: true
      },
      {
        accessorKey: 'price',
        id: 'price',
        header: ({ column }) => (
          <DataGridColumnHeader table={getReactTable()} title='Price ($)' column={column} />
        ),
        cell: (info) => (
          <span {...stylex.props(infiniteStyles.numeric)}>
            ${Number(info.getValue()).toFixed(2)}
          </span>
        ),
        size: 130,
        enableSorting: true
      }
    ],
    []
  )
}

/* ------------------------------------------------------------------ */
/* Local infinite scroll */
/* ------------------------------------------------------------------ */

const LOCAL_TOTAL = 200
const localAllData = generateData(LOCAL_TOTAL)

export const LocalInfiniteScroll: StoryObj<LatencyArgs> = {
  args: { latency: 600 },
  name: 'Local infinite scroll',
  render: ({ latency }) => {
    const tableHolder: { current?: DataGridTableInstance<IRow> } = {}
    const columns = useColumns(() => {
      if (!tableHolder.current) throw new Error('table not ready')
      return tableHolder.current
    })
    const [sorting, setSorting] = useState<SortingState>([])
    const [limit, setLimit] = useState(30)
    const [isFetching, setIsFetching] = useState(false)
    const hasMore = limit < LOCAL_TOTAL

    const fetchMore = useCallback(() => {
      setIsFetching(true)
      window.setTimeout(() => {
        setLimit((old) => Math.min(old + 30, LOCAL_TOTAL))
        setIsFetching(false)
      }, latency)
    }, [latency])

    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: localAllData.slice(0, limit),
      getRowId: (row: IRow) => row.id,
      state: { sorting },
      onSortingChange: setSorting
    })
    tableHolder.current = table

    return (
      <DataGrid table={table} recordCount={limit}>
        <Card style={infiniteStyles.card}>
          <CardContent style={infiniteStyles.cardBody}>
            <DataGridContainer>
              <DataGridScrollAreaProxy>
                <DataGridTableVirtual
                  aria-label='Novels'
                  table={table}
                  estimateSize={41}
                  onFetchMore={hasMore ? fetchMore : undefined}
                  isFetchingMore={isFetching}
                  hasMore={hasMore}
                  height={400}
                />
              </DataGridScrollAreaProxy>
            </DataGridContainer>
          </CardContent>
        </Card>
      </DataGrid>
    )
  }
}

/**
 * Rows that scroll out of a virtualized grid leave the DOM, and the one Tab stop of clickable rows
 * moves to a rendered row instead of vanishing: Tab always has a row to land on.
 */
export const RowClickVirtualized: Story = {
  name: 'Row click, virtualized',
  render: () => {
    const [opened, setOpened] = useState('nothing')
    const tableHolder: { current?: DataGridTableInstance<IRow> } = {}
    const columns = useColumns(() => {
      if (!tableHolder.current) throw new Error('table not ready')
      return tableHolder.current
    })
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: localAllData,
      getRowId: (row: IRow) => row.id,
      // The default page is 10 rows; one page holding every row is what a scrolling grid needs.
      state: { pagination: { pageIndex: 0, pageSize: localAllData.length } }
    })
    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={localAllData.length}
        getRowLabel={(row) => row.title}
        onRowClick={(row) => setOpened(`${row.id} ${row.title}`)}
      >
        <Card style={infiniteStyles.card}>
          <div {...stylex.props(infiniteStyles.header)}>
            <span {...stylex.props(s.muted)}>Opened: {opened}</span>
          </div>
          <CardContent style={infiniteStyles.cardBody}>
            <DataGridContainer>
              <DataGridScrollAreaProxy>
                <DataGridTableVirtual
                  aria-label='Novels'
                  table={table}
                  estimateSize={41}
                  height={400}
                />
              </DataGridScrollAreaProxy>
            </DataGridContainer>
          </CardContent>
        </Card>
      </DataGrid>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    const stops = () => canvasElement.querySelectorAll('tbody tr[tabindex="0"]')
    const firstRow = () => canvasElement.querySelector<HTMLElement>('tbody tr[data-row-clickable]')
    const table = await canvas.findByRole('table', { name: 'Novels' })
    await waitFor(() => expect(stops()).toHaveLength(1))

    // PageDown jumps a page, further than one row and no further than the rows that fit the 400 px
    // view (about 9 of 41 px); PageUp comes back, and stays on the first row.
    const rows = () =>
      Array.from(canvasElement.querySelectorAll<HTMLElement>('tbody tr[data-row-clickable]'))
    const activeIndex = () => rows().findIndex((row) => row === document.activeElement)
    const first = rows()[0]
    if (!first) throw new Error('No rows')
    first.focus()
    await pressUntil('{PageDown}', () => expect(activeIndex()).toBeGreaterThan(1), {
      when: () => document.activeElement === first
    })
    const landed = activeIndex()
    await expect(landed).toBeGreaterThanOrEqual(5)
    await expect(landed).toBeLessThanOrEqual(9)
    await pressUntil('{PageUp}', () => expect(document.activeElement).toBe(first), {
      when: () => document.activeElement !== first
    })
    await userEvent.keyboard('{PageUp}')
    await expect(first).toHaveFocus()
    await waitFor(() => expect(stops()).toHaveLength(1))

    // Scroll far enough that the first rows leave the DOM: the stop moves, and is still one.
    let scroller: HTMLElement | null = table.parentElement
    while (scroller && getComputedStyle(scroller).overflowY !== 'auto') {
      scroller = scroller.parentElement
    }
    if (!scroller) throw new Error('No scroll container')
    const before = firstRow()?.dataset.rowId
    scroller.scrollTop = 41 * 120
    await waitFor(() => expect(firstRow()?.dataset.rowId).not.toBe(before))
    await waitFor(() => expect(stops()).toHaveLength(1))
    await expect(stops()[0]).toBe(firstRow())

    // Enter on the row that is the stop opens that row.
    const stop = stops()[0]
    if (!(stop instanceof HTMLElement)) throw new Error('No row stop')
    stop.focus()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByText(/^Opened: /)).toHaveTextContent(`Opened: ${stop.dataset.rowId} `)
  }
}

/* ------------------------------------------------------------------ */
/* Remote infinite scroll */
/* ------------------------------------------------------------------ */

const REMOTE_TOTAL = 200
const REMOTE_PAGE = 20

export const RemoteInfiniteScroll: StoryObj<LatencyArgs> = {
  args: { latency: 700 },
  name: 'Remote infinite scroll',
  render: ({ latency }) => {
    const tableHolder: { current?: DataGridTableInstance<IRow> } = {}
    const columns = useColumns(() => {
      if (!tableHolder.current) throw new Error('table not ready')
      return tableHolder.current
    })
    const [sorting, setSorting] = useState<SortingState>([])
    const [data, setData] = useState<IRow[]>(() =>
      Array.from({ length: REMOTE_PAGE }, (_, index) => simulateRow(index))
    )
    const [isFetching, setIsFetching] = useState(false)
    const timeoutRef = useRef<number | null>(null)
    const hasMore = data.length < REMOTE_TOTAL

    useEffect(() => {
      return () => {
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      }
    }, [])

    const fetchMore = useCallback(() => {
      setIsFetching(true)
      timeoutRef.current = window.setTimeout(() => {
        setData((old) => {
          const next = Array.from({ length: REMOTE_PAGE }, (_, offset) =>
            simulateRow(old.length + offset)
          )
          return [...old, ...next]
        })
        setIsFetching(false)
      }, latency)
    }, [latency])

    const table = useTable({
      features: dataGridFeatures,
      columns,
      data,
      getRowId: (row: IRow) => row.id,
      state: { sorting },
      onSortingChange: setSorting
    })
    tableHolder.current = table

    return (
      <DataGrid table={table} recordCount={data.length}>
        <Card style={infiniteStyles.card}>
          <div {...stylex.props(infiniteStyles.header)}>
            <span {...stylex.props(s.strong)}>
              {data.length} of {REMOTE_TOTAL} records
            </span>
            <Button
              variant='ghost'
              size='small'
              icon={RefreshCw}
              aria-label='Reset'
              onClick={() => {
                setData(Array.from({ length: REMOTE_PAGE }, (_, index) => simulateRow(index)))
              }}
            />
          </div>
          <CardContent style={infiniteStyles.cardBody}>
            <DataGridContainer>
              <DataGridScrollAreaProxy>
                <DataGridTableVirtual
                  aria-label='Novels'
                  table={table}
                  estimateSize={41}
                  onFetchMore={hasMore ? fetchMore : undefined}
                  isFetchingMore={isFetching}
                  hasMore={hasMore}
                  height={400}
                />
              </DataGridScrollAreaProxy>
            </DataGridContainer>
          </CardContent>
        </Card>
      </DataGrid>
    )
  }
}

/* ------------------------------------------------------------------ */
/* Column virtualization */
/* ------------------------------------------------------------------ */

const METRIC_COLUMN_COUNT = 36
// Same scale as the source pattern: enough columns to prove windowing.
const ROW_COUNT = 1000
const COLUMN_JUMP_SIZE = 8
const matrixRows = generateData(ROW_COUNT)
const columnVirtualizerOptions = { enabled: true, overscan: 3 }

function matrixColumns(
  getReactTable: () => DataGridTableInstance<IRow>
): ColumnDef<DataGridFeatures, IRow>[] {
  return [
    {
      accessorKey: 'title',
      id: 'title',
      header: ({ column }) => (
        <DataGridColumnHeader table={getReactTable()} title='Title' column={column} />
      ),
      cell: ({ row }) => <span {...stylex.props(s.strong)}>{row.original.title}</span>,
      size: 180,
      enablePinning: true,
      enableResizing: true
    },
    ...Array.from({ length: METRIC_COLUMN_COUNT }, (_, metric) => {
      return {
        accessorKey: 'price',
        id: `metric-${metric + 1}`,
        header: (headerContext: { column: Column<DataGridFeatures, IRow> }) => (
          <DataGridColumnHeader
            table={getReactTable()}
            title={`M${String(metric + 1).padStart(2, '0')}`}
            column={headerContext.column}
          />
        ),
        cell: (info: { getValue: () => unknown }) => (
          <span {...stylex.props(infiniteStyles.numeric)}>
            {Number(info.getValue()).toFixed(0)}
          </span>
        ),
        size: 110,
        enableResizing: false
      }
    })
  ]
}

export const ColumnVirtualization: Story = {
  name: 'Column virtualization',
  render: () => {
    const [targetColumnIndex, setTargetColumnIndex] = useState(0)
    const tableHolder: { current?: DataGridTableInstance<IRow> } = {}
    const columns = useMemo(
      () =>
        matrixColumns(() => {
          if (!tableHolder.current) throw new Error('table not ready')
          return tableHolder.current
        }),
      []
    )
    const [sorting, setSorting] = useState<SortingState>([])
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: matrixRows,
      getRowId: (row: IRow) => row.id,
      // Full pinning state: table-core 9.2 reads `start`/`end` as arrays
      // (row_getCenterVisibleCells spreads both), so a partial `{ start }`
      // crashes with "end is not iterable".
      state: { sorting, columnPinning: { start: ['title'], end: [] } },
      onSortingChange: setSorting
    })
    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={matrixRows.length}
        tableLayout={{
          width: 'fixed',
          dense: true,
          columnsPinnable: true,
          columnsResizable: true,
          headerSticky: true
        }}
      >
        <Card style={infiniteStyles.cardOverflow}>
          <div {...stylex.props(infiniteStyles.header)}>
            <span {...stylex.props(s.strong)}>Performance Matrix</span>
            <span {...stylex.props(s.muted)}>
              Metric {String(targetColumnIndex + 1).padStart(2, '0')} of {METRIC_COLUMN_COUNT}
            </span>
            <div {...stylex.props(s.cellFlex)}>
              <Button
                variant='outline'
                size='small'
                onClick={() => setTargetColumnIndex((old) => Math.max(0, old - COLUMN_JUMP_SIZE))}
              >
                Prev
              </Button>
              <Button
                variant='outline'
                size='small'
                onClick={() =>
                  setTargetColumnIndex((old) =>
                    Math.min(METRIC_COLUMN_COUNT - 1, old + COLUMN_JUMP_SIZE)
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
          <CardContent style={infiniteStyles.cardBody}>
            <DataGridContainer>
              <DataGridScrollAreaProxy>
                <DataGridTableVirtual
                  aria-label='Novels'
                  table={table}
                  estimateSize={41}
                  height={420}
                  overscan={8}
                  scrollBehavior='smooth'
                  scrollToColumnIndex={targetColumnIndex}
                  scrollToColumnAlign='center'
                  columnVirtualizerOptions={columnVirtualizerOptions}
                />
              </DataGridScrollAreaProxy>
            </DataGridContainer>
          </CardContent>
        </Card>
      </DataGrid>
    )
  }
}
