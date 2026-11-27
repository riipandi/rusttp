import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import { ChevronDown, ChevronUp, RefreshCw } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { useTable } from '@tanstack/react-table'
import type {
  Column,
  ColumnDef,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState
} from '@tanstack/react-table'
import { Fragment, useMemo, useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
  DataGridTableRowPin,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
  DataGridTableRowExpand,
  DataGridTableDndRowHandle,
  DataGridTableDndRows,
  dataGridFeatures,
  type DataGridFeatures,
  type DataGridTableInstance
} from '../'
import { Avatar, AvatarFallback } from '../../base/avatar'
import { Button, buttonSquare } from '../../base/button'
import { pressUntil } from '../../contracts/keyboard'
import { Badge } from '../../extra/badge'
import { Card, CardContent, CardFooter, CardHeader } from '../../extra/card'
import { unit } from '../../styles/tokens.stylex'
import { visuallyHidden } from '../../styles/utils.stylex'
import { demoData, type IBook } from './_mocks'
import { stackStyles as s } from './_mocks.stylex'

const meta = {
  title: 'Data Grid/Rows',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div {...stylex.props(atoms.padding['20px'], atoms.width['100%'])}>
        <Story />
      </div>
    )
  ]
} satisfies Meta

type Story = StoryObj<typeof meta>
export default meta

/* ------------------------------------------------------------------ */
/* Shared module-scope styles */
/* ------------------------------------------------------------------ */

const statusStyles = stylex.create({
  muted: {
    color: s.muted.color
  },
  expanderButton: {
    marginInlineStart: `calc(-1 * ${unit.x2})`
  },
  expanderIcon: {
    height: 16,
    width: 16
  },
  expandedContent: {
    paddingBlock: unit.x3,
    paddingInline: unit.x8
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    paddingBlock: unit.x3,
    width: '100%'
  },
  cardHeader: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBlock: unit.x3,
    paddingInline: unit.x5
  },
  cardBody: {
    padding: 0
  },
  edgeCell: { paddingInline: unit.x5 },
  cardFooter: {
    paddingBlock: unit.x3
  },
  cardOverflow: {
    overflow: 'hidden',
    paddingBlock: unit.x3
  }
})

/* ------------------------------------------------------------------ */
/* Row selection */
/* ------------------------------------------------------------------ */

function selectionColumns(
  getTable: () => DataGridTableInstance<IBook>
): ColumnDef<DataGridFeatures, IBook>[] {
  return [
    {
      id: 'select',
      meta: { headerTitle: 'Select all' },
      size: 40,
      header: () => <DataGridTableRowSelectAll table={getTable()} />,
      cell: ({ row }) => <DataGridTableRowSelect row={row} />
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (info) => <span {...stylex.props(s.strong)}>{String(info.getValue())}</span>,
      size: 160
    },
    {
      accessorKey: 'author',
      header: 'Author',
      size: 200
    },
    {
      accessorKey: 'country',
      header: 'Country',
      size: 150
    },
    {
      accessorKey: 'price',
      header: 'Price ($)',
      cell: (info) => <>${Number(info.getValue()).toFixed(2)}</>,
      size: 120
    }
  ]
}

/** What dnd-kit's live region says: the keyboard drag announcement a screen reader hears. */
const live = () => document.querySelector('[id^="DndLiveRegion"]')?.textContent ?? ''

/** The `aria-label` of every control whose label starts with `prefix`, in document order. */
function labelsStartingWith(root: HTMLElement, prefix: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(`[aria-label^="${prefix}"]`)).map(
    (el) => el.getAttribute('aria-label') ?? ''
  )
}

export const RowSelection: Story = {
  name: 'Row selection',
  render: () => {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 5
    })
    const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: true }])
    const selectedCount = Object.keys(rowSelection).length

    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(
      () =>
        selectionColumns(() => {
          if (!tableHolder.current) throw new Error('table not ready')
          return tableHolder.current
        }),
      [tableHolder]
    )
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: demoData,
      pageCount: Math.ceil(demoData.length / pagination.pageSize),
      getRowId: (row: IBook) => row.id,
      state: { pagination, sorting, rowSelection },
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onPaginationChange: setPagination,
      onSortingChange: setSorting
    })
    tableHolder.current = table

    return (
      <DataGrid table={table} recordCount={demoData.length} getRowLabel={(row) => row.title}>
        <div {...stylex.props(s.stack)}>
          <span {...stylex.props(s.muted)}>
            {selectedCount} of {demoData.length} selected
          </span>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  },
  // Ten identical "Select row" checkboxes were the defect: each one is named after its row now.
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole('table', { name: 'Novels' })
    const names = labelsStartingWith(canvasElement, 'Select ').filter(
      (name) => name !== 'Select all'
    )
    await expect(names).toHaveLength(5)
    await expect(new Set(names).size).toBe(5)
    const titles = new Set(demoData.map((book) => `Select ${book.title}`))
    await expect(names.every((name) => titles.has(name))).toBe(true)
    await expect(canvas.getByRole('checkbox', { name: names[0] })).toBeVisible()
  }
}

/** The rows that are Tab stops: with `onRowClick` set there is exactly one at a time. */
const rowStops = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('tbody tr[tabindex="0"]'))

/**
 * With `onRowClick`, the rows are one Tab stop: the arrows move between rows, and Enter or Space on
 * a row opens it. A control inside the row (the checkbox) keeps its own keys.
 */
export const RowClick: Story = {
  name: 'Row click',
  render: () => {
    const [opened, setOpened] = useState('nothing')
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(
      () =>
        selectionColumns(() => {
          if (!tableHolder.current) throw new Error('table not ready')
          return tableHolder.current
        }),
      [tableHolder]
    )
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: demoData,
      pageCount: Math.ceil(demoData.length / pagination.pageSize),
      getRowId: (row: IBook) => row.id,
      state: { pagination, rowSelection },
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onPaginationChange: setPagination
    })
    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData.length}
        getRowLabel={(row) => row.title}
        onRowClick={(row) => setOpened(row.title)}
      >
        <div {...stylex.props(s.stack)}>
          <span {...stylex.props(s.muted)}>Opened: {opened}</span>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole('table', { name: 'Novels' })
    const bodyRows = () => Array.from(canvasElement.querySelectorAll<HTMLElement>('tbody tr'))
    const status = () => canvas.getByText(/^Opened:/)
    const focusedRow = (index: number) => waitFor(() => expect(bodyRows()[index]).toHaveFocus())

    // One Tab stop for all five rows: the first.
    await waitFor(() => expect(rowStops(canvasElement)).toHaveLength(1))
    await expect(rowStops(canvasElement)[0]).toBe(bodyRows()[0])
    await expect(bodyRows().every((row) => row.tabIndex >= -1)).toBe(true)
    await expect(bodyRows().filter((row) => row.tabIndex === -1)).toHaveLength(4)

    // The arrows move between rows, Home and End jump, and the stop follows focus.
    bodyRows()[0]!.focus()
    await pressUntil('{ArrowDown}', () => focusedRow(1), {
      when: () => document.activeElement === bodyRows()[0]
    })
    await pressUntil('{ArrowDown}', () => focusedRow(2), {
      when: () => document.activeElement === bodyRows()[1]
    })
    await waitFor(() => expect(rowStops(canvasElement)).toEqual([bodyRows()[2]]))
    await pressUntil('{End}', () => focusedRow(4))
    await pressUntil('{Home}', () => focusedRow(0))
    await pressUntil('{ArrowUp}', () => expect(document.activeElement).toBe(bodyRows()[0]))

    // PageDown and PageUp move a page of rows and stop at the ends: five rows fit one page, so the
    // page reaches the last row and back.
    await pressUntil('{PageDown}', () => focusedRow(4), {
      when: () => document.activeElement === bodyRows()[0]
    })
    await userEvent.keyboard('{PageDown}')
    await focusedRow(4)
    await pressUntil('{PageUp}', () => focusedRow(0), {
      when: () => document.activeElement === bodyRows()[4]
    })
    await userEvent.keyboard('{PageUp}')
    await focusedRow(0)

    // Enter and Space on the row open it, with the right row.
    bodyRows()[1]!.focus()
    await userEvent.keyboard('{Enter}')
    await expect(status()).toHaveTextContent(`Opened: ${demoData[1]!.title}`)
    bodyRows()[3]!.focus()
    await userEvent.keyboard(' ')
    await expect(status()).toHaveTextContent(`Opened: ${demoData[3]!.title}`)

    // A checkbox inside the row keeps its own keys: Space toggles it and does not open the row.
    const box = () => canvas.getByRole('checkbox', { name: `Select ${demoData[0]!.title}` })
    box().focus()
    await expect(box()).toHaveFocus()
    await userEvent.keyboard(' ')
    await waitFor(() => expect(box()).toBeChecked())
    await expect(status()).toHaveTextContent(`Opened: ${demoData[3]!.title}`)

    // Tab from the rows leaves them: the stop is one row, not five.
    bodyRows()[2]!.focus()
    await userEvent.tab()
    await expect(bodyRows().some((row) => row === document.activeElement)).toBe(false)

    // The focused row draws the library ring: 2 px, solid, inside the row.
    bodyRows()[2]!.focus()
    await waitFor(() => expect(bodyRows()[2]).toHaveFocus())
    const ring = getComputedStyle(bodyRows()[2]!)
    await expect(ring.outlineWidth).toBe('2px')
    await expect(ring.outlineStyle).toBe('solid')
    await expect(parseFloat(ring.outlineOffset)).toBeLessThan(0)
  }
}

/* ------------------------------------------------------------------ */
/* Expandable rows */
/* ------------------------------------------------------------------ */

interface IDetail extends IBook {
  details: string
}

// The features bundle erases TData, so expanded rows arrive as unknown.
const isDetailRow = (row: unknown): row is IDetail =>
  typeof row === 'object' && row !== null && 'details' in row

const isOrderRow = (row: unknown): row is IOrder =>
  typeof row === 'object' && row !== null && 'lines' in row

const detailData: IDetail[] = demoData.slice(0, 5).map((row, index) => ({
  ...row,
  details:
    index % 2 === 0
      ? 'Includes the illustrated edition, author notes and a reading guide.'
      : 'Preview copy; chapters after 12 are locked.'
}))

function ExpandableColumns(): ColumnDef<DataGridFeatures, IDetail>[] {
  return [
    {
      id: 'expander',
      header: () => <span {...stylex.props(visuallyHidden.root)}>Expand</span>,
      cell: ({ row }) =>
        row.getCanExpand() ? (
          <Button
            variant='ghost'
            style={[buttonSquare.medium, statusStyles.expanderButton]}
            onClick={row.getToggleExpandedHandler()}
            aria-label={`${row.getIsExpanded() ? 'Collapse' : 'Expand'} ${row.original.title}`}
          >
            {row.getIsExpanded() ? (
              <ChevronUp aria-hidden='true' {...stylex.props(statusStyles.expanderIcon)} />
            ) : (
              <ChevronDown aria-hidden='true' {...stylex.props(statusStyles.expanderIcon)} />
            )}
          </Button>
        ) : null,
      size: 48,
      meta: {
        // Receives `row.original` (source contract), not the TanStack row.
        // The features bundle erases TData, so narrow here.
        expandedContent: (rawRow) =>
          isDetailRow(rawRow) ? (
            <div {...stylex.props(statusStyles.muted, statusStyles.expandedContent)}>
              {rawRow.details}
            </div>
          ) : null
      }
    },
    {
      accessorKey: 'title',
      header: 'Title',
      size: 180
    },
    {
      accessorKey: 'author',
      header: 'Author',
      size: 200
    },
    {
      accessorKey: 'role',
      header: 'Genre',
      size: 150
    },
    {
      id: 'details',
      header: 'Notes',
      cell: ({ row }) => <span {...stylex.props(s.muted)}>{row.original.details}</span>,
      size: 320
    }
  ]
}

export const ExpandableRows: Story = {
  name: 'Expandable rows',
  render: () => {
    const [expanded, setExpanded] = useState<ExpandedState>({})
    const columns = useMemo(() => ExpandableColumns(), [])
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: detailData,
      getRowId: (row: IDetail) => row.id,
      getRowCanExpand: (row) => Boolean(row.original.details),
      state: { expanded },
      onExpandedChange: setExpanded
    })

    return (
      <DataGrid
        table={table}
        recordCount={detailData.length}
        tableLayout={{ headerBackground: false }}
        tableStyles={{ edgeCell: s.edgeCell }}
      >
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Novels' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    )
  },
  // The story's own expander names its row too, so five rows are five different buttons.
  play: async ({ canvas }) => {
    const first = detailData[0]!.title
    const second = detailData[1]!.title
    await expect(await canvas.findByRole('button', { name: `Expand ${first}` })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: `Expand ${second}` }))
    await expect(await canvas.findByRole('button', { name: `Collapse ${second}` })).toBeVisible()
    await expect(canvas.getByRole('button', { name: `Expand ${first}` })).toBeVisible()
  }
}

/* ------------------------------------------------------------------ */
/* Sub table (condensed) */
/* ------------------------------------------------------------------ */

interface IOrder {
  id: string
  order: string
  customer: string
  items: number
  total: number
  lines: { sku: string; name: string; qty: number; price: number }[]
}

const orderData: IOrder[] = [
  {
    id: '1',
    order: 'ORD-2041',
    customer: 'Sarah Chen',
    items: 3,
    total: 249.0,
    lines: [
      { sku: 'SKU-102', name: 'Keyboard', qty: 1, price: 99 },
      { sku: 'SKU-233', name: 'Mouse', qty: 2, price: 75 }
    ]
  },
  {
    id: '2',
    order: 'ORD-2042',
    customer: 'Michael Rodriguez',
    items: 1,
    total: 1299.0,
    lines: [{ sku: 'SKU-777', name: 'Studio Display', qty: 1, price: 1299 }]
  },
  {
    id: '3',
    order: 'ORD-2043',
    customer: 'Emma Wilson',
    items: 2,
    total: 340.5,
    lines: [
      { sku: 'SKU-310', name: 'Desk lamp', qty: 1, price: 120.5 },
      { sku: 'SKU-412', name: 'USB-C hub', qty: 1, price: 220 }
    ]
  }
]

/** Price cell shared by the order-line tables (currency, two decimals). */
const priceCell = (info: { getValue: () => unknown }) => <>${Number(info.getValue()).toFixed(2)}</>

function SubTable({ items }: { items: IOrder['lines'] }) {
  const columns = useMemo<ColumnDef<DataGridFeatures, IOrder['lines'][number]>[]>(
    () => [
      { accessorKey: 'sku', header: 'SKU', size: 120 },
      { accessorKey: 'title', header: 'Item', size: 240 },
      { accessorKey: 'qty', header: 'Qty', size: 80 },
      {
        accessorKey: 'price',
        header: 'Price ($)',
        cell: priceCell,
        size: 120
      }
    ],
    []
  )
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: items,
    getRowId: (row) => row.sku
  })

  return (
    <div style={{ paddingBlock: 8, paddingInline: 32 }}>
      <DataGrid table={table} recordCount={items.length}>
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Items' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    </div>
  )
}

export const SubTableStory: Story = {
  name: 'Sub table',
  render: () => {
    const [expanded, setExpanded] = useState<ExpandedState>({ '1': true })
    const columns = useMemo<ColumnDef<DataGridFeatures, IOrder>[]>(
      () => [
        {
          accessorKey: 'order',
          header: 'Order',
          size: 140
        },
        {
          accessorKey: 'customer',
          header: 'Customer',
          size: 180
        },
        {
          accessorKey: 'items',
          header: 'Items',
          size: 90
        },
        {
          accessorKey: 'total',
          header: 'Total ($)',
          cell: (info) => <>${Number(info.getValue()).toFixed(2)}</>,
          size: 120,
          meta: {
            // The features bundle erases TData, so narrow here.
            expandedContent: (rawRow) =>
              isOrderRow(rawRow) ? <SubTable items={rawRow.lines} /> : null
          }
        }
      ],
      []
    )
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: orderData,
      getRowId: (row: IOrder) => row.id,
      getRowCanExpand: (row) => row.original.lines.length > 0,
      state: { expanded },
      onExpandedChange: setExpanded
    })

    return (
      <DataGrid table={table} recordCount={orderData.length}>
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Orders' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    )
  }
}

/* ------------------------------------------------------------------ */
/* Draggable rows */
/* ------------------------------------------------------------------ */

export const DraggableRows: Story = {
  name: 'Draggable rows',
  render: () => {
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 8
    })
    // The reorder is the demo's visible effect: dropping a row onto another
    // swaps their positions in a local copy of the data.
    const [rows, setRows] = useState<IBook[]>(demoData)
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          id: 'drag',
          size: 40,
          header: () => <span {...stylex.props(visuallyHidden.root)}>Reorder</span>,
          cell: () => <DataGridTableDndRowHandle />
        },
        {
          accessorKey: 'title',
          header: 'Title',
          cell: ({ row }) => <span {...stylex.props(s.strong)}>{row.original.title}</span>,
          size: 160
        },
        {
          accessorKey: 'role',
          header: 'Genre',
          size: 160
        },
        {
          accessorKey: 'country',
          header: 'Country',
          size: 160
        },
        {
          accessorKey: 'price',
          header: 'Price ($)',
          cell: (info) => <>${Number(info.getValue()).toFixed(2)}</>,
          size: 120
        }
      ],
      []
    )
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: rows,
      getRowId: (row: IBook) => row.id,
      state: { pagination },
      onPaginationChange: setPagination
    })
    const dataIds = useMemo<UniqueIdentifier[]>(
      () => table.getRowModel().rows.map((row) => row.id),
      [table]
    )
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      setRows((current) => {
        const from = current.findIndex((row) => row.id === active.id)
        const to = current.findIndex((row) => row.id === over.id)
        if (from === -1 || to === -1) return current
        const next = [...current]
        const [moved] = next.splice(from, 1)
        if (!moved) return current
        next.splice(to, 0, moved)
        return next
      })
    }

    return (
      <DataGrid table={table} recordCount={rows.length} getRowLabel={(row) => row.title}>
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTableDndRows
                aria-label='Novels'
                table={table}
                handleDragEnd={handleDragEnd}
                dataIds={dataIds}
              />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole('table', { name: 'Novels' })
    const names = labelsStartingWith(canvasElement, 'Drag to reorder ')
    await expect(names.length).toBeGreaterThan(1)
    await expect(new Set(names).size).toBe(names.length)
    const titles = new Set(demoData.map((book) => `Drag to reorder ${book.title}`))
    await expect(names.every((name) => titles.has(name))).toBe(true)

    // A keyboard drag speaks the row's title, never its id or dnd-kit's "draggable item".
    const handle = (name: string) => canvas.getByRole('button', { name })
    const first = names[0]!
    const title = first.replace('Drag to reorder ', '')
    const next = names[1]!.replace('Drag to reorder ', '')
    handle(first).focus()
    await pressUntil(' ', () => expect(live()).toBe(`Picked up ${title}.`), {
      when: () => live() !== `Picked up ${title}.`
    })
    await pressUntil('{ArrowDown}', () => expect(live()).toBe(`${title} moved over ${next}.`), {
      when: () => live() !== `${title} moved over ${next}.`
    })
    await pressUntil(' ', () => expect(live()).toBe(`${title} dropped over ${next}.`), {
      when: () => live() !== `${title} dropped over ${next}.`
    })
    // Lift it again and cancel with Escape.
    await waitFor(() => expect(handle(first)).toBeVisible())
    handle(first).focus()
    await pressUntil(' ', () => expect(live()).toBe(`Picked up ${title}.`), {
      when: () => live() !== `Picked up ${title}.`
    })
    await pressUntil('{Escape}', () =>
      expect(live()).toBe(`Dragging cancelled. ${title} returned to its place.`)
    )
  }
}

const borderColumns: ColumnDef<DataGridFeatures, IBook>[] = [
  { id: 'drag', size: 40, header: () => 'Reorder', cell: () => <DataGridTableDndRowHandle /> },
  { accessorKey: 'title', header: 'Title', size: 240 }
]

function BorderGrid({ label, rowBorder }: { label: string; rowBorder?: boolean }) {
  const data = demoData.slice(0, 3)
  const table = useTable({
    features: dataGridFeatures,
    columns: borderColumns,
    data,
    getRowId: (row: IBook) => row.id
  })
  const dataIds = useMemo<UniqueIdentifier[]>(() => data.map((row) => row.id), [data])
  return (
    <DataGrid
      table={table}
      recordCount={data.length}
      getRowLabel={(row) => row.title}
      tableLayout={rowBorder === undefined ? undefined : { rowBorder }}
    >
      <DataGridContainer>
        <DataGridScrollArea table={table}>
          <DataGridTableDndRows
            aria-label={label}
            table={table}
            handleDragEnd={() => {}}
            dataIds={dataIds}
          />
        </DataGridScrollArea>
      </DataGridContainer>
    </DataGrid>
  )
}

/**
 * `tableLayout.rowBorder` is on by default: draggable rows draw a separator under every row but
 * the last, like any other row, and `rowBorder: false` removes them.
 */
export const DraggableRowBorders: Story = {
  name: 'Draggable rows, borders',
  render: () => (
    <div {...stylex.props(s.stack)}>
      <BorderGrid label='Default borders' />
      <BorderGrid label='No borders' rowBorder={false} />
    </div>
  ),
  play: async ({ canvas }) => {
    const separators = async (name: string) => {
      const grid = await canvas.findByRole('table', { name })
      return Array.from(grid.querySelectorAll('tbody tr[data-row-id]')).map((row) => {
        const cell = row.querySelector('td')
        return cell ? getComputedStyle(cell).borderBottomWidth : 'no cell'
      })
    }
    await expect(await separators('Default borders')).toEqual(['1px', '1px', '0px'])
    await expect(await separators('No borders')).toEqual(['0px', '0px', '0px'])
  }
}

/** A column pinned to the end keeps its width in a grid with draggable rows. */
export const DraggableRowsEndPinned: Story = {
  name: 'Draggable rows, end pinned column',
  render: () => {
    const data = demoData.slice(0, 3)
    const table = useTable({
      features: dataGridFeatures,
      columns: borderColumns,
      data,
      getRowId: (row: IBook) => row.id,
      initialState: { columnPinning: { start: [], end: ['title'] } }
    })
    const dataIds = useMemo<UniqueIdentifier[]>(() => data.map((row) => row.id), [data])
    return (
      <DataGrid
        table={table}
        recordCount={data.length}
        getRowLabel={(row) => row.title}
        tableLayout={{ columnsPinnable: true, columnsResizable: true }}
      >
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTableDndRows
              aria-label='Pinned end'
              table={table}
              handleDragEnd={() => {}}
              dataIds={dataIds}
            />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    )
  },
  play: async ({ canvas }) => {
    const grid = await canvas.findByRole('table', { name: 'Pinned end' })
    const width = Number.parseFloat(grid.style.getPropertyValue('--col-title-size'))
    for (const selector of ['thead th', 'tbody tr td']) {
      const cell = grid.querySelector(`${selector}[data-col-id="title"]`)
      if (!(cell instanceof HTMLElement)) throw new Error(`No ${selector} title cell`)
      await expect(cell.getBoundingClientRect().width).toBeCloseTo(width, 0)
    }
  }
}

/* ------------------------------------------------------------------ */
/* Row pinning */
/* ------------------------------------------------------------------ */

export const RowPinningSupport: Story = {
  name: 'Row pinning support',
  render: () => {
    const [rowPinning, setRowPinning] = useState<{ top: string[]; bottom: string[] }>({
      top: ['1'],
      bottom: []
    })
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 8
    })
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          id: 'pin',
          size: 40,
          header: () => <span {...stylex.props(visuallyHidden.root)}>Pin</span>,
          cell: ({ row }) => <DataGridTableRowPin row={row} table={tableHolder.current!} />
        },
        {
          accessorKey: 'title',
          header: 'Catalog',
          meta: { autoSize: true },
          cell: ({ row }) => (
            <div {...stylex.props(s.cellFlex)}>
              <Avatar style={s.avatar24}>
                <AvatarFallback>{row.original.initials}</AvatarFallback>
              </Avatar>
              <span {...stylex.props(s.strong)}>{row.original.title}</span>
            </div>
          ),
          size: 200
        },
        {
          accessorKey: 'role',
          header: 'Genre',
          size: 180
        },
        {
          accessorKey: 'country',
          header: 'Country',
          size: 160
        }
      ],
      []
    )
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: demoData,
      getRowId: (row: IBook) => row.id,
      state: { pagination, rowPinning },
      onRowPinningChange: setRowPinning,
      onPaginationChange: setPagination,
      paginateExpandedRows: false
    })
    tableHolder.current = table
    const pinnedCount = rowPinning.top.length

    return (
      <DataGrid
        table={table}
        recordCount={demoData.length}
        tableLayout={{ rowsPinnable: true, columnsResizable: true }}
        tableStyles={{ edgeCell: s.edgeCell }}
      >
        <Card style={statusStyles.card}>
          <CardHeader style={statusStyles.cardHeader}>
            <div {...stylex.props(s.cellFlex)}>
              <span {...stylex.props(s.strong)}>Catalog</span>
              {pinnedCount > 0 ? <Badge variant='solid'>{pinnedCount} pinned</Badge> : null}
            </div>
            {pinnedCount > 0 ? (
              <Button
                variant='ghost'
                size='small'
                onClick={() => setRowPinning({ top: [], bottom: [] })}
              >
                Unpin all
              </Button>
            ) : (
              <Button variant='ghost' size='small' icon={RefreshCw} aria-label='Reset' />
            )}
          </CardHeader>
          <CardContent style={statusStyles.cardBody}>
            <DataGridContainer>
              <DataGridScrollArea table={table}>
                <DataGridTable aria-label='Novels' table={table} />
              </DataGridScrollArea>
            </DataGridContainer>
          </CardContent>
          <CardFooter style={statusStyles.cardFooter}>
            <DataGridPagination table={table} />
          </CardFooter>
        </Card>
      </DataGrid>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole('table', { name: 'Novels' })
    // No `getRowLabel` here, so a row is named by its position in the data (`Row 1`, `Row 2`).
    // The row pinned at the start reads "Unpin Row 1"; the others read "Pin Row N".
    const pins = labelsStartingWith(canvasElement, 'Pin ')
    const unpins = labelsStartingWith(canvasElement, 'Unpin ')
    await expect(unpins).toHaveLength(1)
    await expect(pins.length).toBeGreaterThan(0)
    await expect(new Set([...pins, ...unpins]).size).toBe(pins.length + unpins.length)
    await expect(pins.every((name) => /^Pin Row \d+$/.test(name))).toBe(true)
    await expect(unpins).toEqual(['Unpin Row 1'])
    // Pinning a row renames its own button only.
    const target = pins[0]!
    await userEvent.click(canvas.getByRole('button', { name: target }))
    await expect(
      await canvas.findByRole('button', { name: target.replace('Pin ', 'Unpin ') })
    ).toBeVisible()
  }
}

/* ------------------------------------------------------------------ */
/* Tree rows (condensed) */
/* ------------------------------------------------------------------ */

interface ITreeNode {
  id: string
  name: string
  type: 'author' | 'series' | 'book'
  genre?: string
  status: 'inPrint' | 'outOfPrint'
  children?: ITreeNode[]
}

const treeData: ITreeNode[] = [
  {
    id: 'brown',
    name: 'Dan Brown',
    type: 'author',
    status: 'inPrint',
    children: [
      {
        id: 'brown-langdon',
        name: 'Robert Langdon series',
        type: 'series',
        status: 'inPrint',
        children: [
          {
            id: 'brown-langdon-1',
            name: 'Angels & Demons',
            type: 'book',
            genre: 'Thriller',
            status: 'inPrint'
          },
          {
            id: 'brown-langdon-2',
            name: 'The Da Vinci Code',
            type: 'book',
            genre: 'Thriller',
            status: 'inPrint'
          }
        ]
      },
      {
        id: 'brown-standalone',
        name: 'Standalone novels',
        type: 'series',
        status: 'inPrint',
        children: [
          {
            id: 'brown-standalone-1',
            name: 'Digital Fortress',
            type: 'book',
            genre: 'Techno-thriller',
            status: 'outOfPrint'
          }
        ]
      }
    ]
  },
  {
    id: 'rowling',
    name: 'J.K. Rowling',
    type: 'author',
    status: 'inPrint',
    children: [
      {
        id: 'rowling-1',
        name: "Harry Potter and the Philosopher's Stone",
        type: 'book',
        genre: 'Fantasy',
        status: 'inPrint'
      }
    ]
  }
]

/** The tree grid; `pageSize` makes a short page so the pager shows with two top-level rows. */
function TreeGrid({ pageSize }: { pageSize?: number }) {
  const [expanded, setExpanded] = useState<ExpandedState>({
    eng: true,
    'eng-platform': true
  })
  const tableHolder: { current?: DataGridTableInstance<ITreeNode> } = {}
  const columns = useMemo<ColumnDef<DataGridFeatures, ITreeNode>[]>(
    () => [
      {
        accessorKey: 'title',
        id: 'title',
        header: ({ column }) => (
          <DataGridColumnHeaderInline table={tableHolder.current!} title='Title' column={column} />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div {...stylex.props(s.cellFlex)}>
              <DataGridTableRowExpand row={row} />
              {item.type === 'book' ? (
                <Fragment>
                  <Avatar style={s.avatar24}>
                    <AvatarFallback>
                      {item.name
                        .split(' ')
                        .filter((n) => n.length > 2 && n !== 'the' && n !== 'and')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <a href={`#${item.id}`} {...stylex.props(s.link, s.strong)}>
                    {item.name}
                  </a>
                </Fragment>
              ) : (
                <span {...stylex.props(s.strong)}>{item.name}</span>
              )}
            </div>
          )
        },
        minSize: 260,
        enableSorting: true,
        enableHiding: false,
        meta: { autoSize: true }
      },
      {
        accessorKey: 'genre',
        header: 'Genre',
        cell: ({ row }) => (
          <span {...stylex.props(s.muted)}>
            {row.original.genre ?? (row.original.type === 'author' ? 'Author' : 'Series')}
          </span>
        ),
        size: 180
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) =>
          row.original.status === 'inPrint' ? (
            <Badge variant='faded'>In print</Badge>
          ) : (
            <Badge color='critical'>Out of print</Badge>
          ),
        size: 130
      }
    ],
    []
  )
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: treeData,
    initialState: pageSize ? { pagination: { pageIndex: 0, pageSize } } : undefined,
    getRowId: (row: ITreeNode) => row.id,
    getSubRows: (row) => row.children,
    state: { expanded },
    onExpandedChange: setExpanded,
    paginateExpandedRows: false
  })
  tableHolder.current = table

  return (
    <DataGrid
      table={table}
      recordCount={treeData.length}
      getRowLabel={(node) => node.name}
      tableLayout={{
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true
      }}
    >
      <div {...stylex.props(s.stack)}>
        <Card style={statusStyles.cardOverflow}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Authors and novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
        </Card>
        <DataGridPagination table={table} sizes={[4, 8, 16]} />
      </div>
    </DataGrid>
  )
}

export const TreeRows: Story = {
  name: 'Tree rows',
  render: () => <TreeGrid />
}

const turn = (el: Element) => new DOMMatrix(getComputedStyle(el).transform)

/**
 * The tree grid under `dir='rtl'` with no `lang`: the collapsed chevron points to the start (left)
 * and the pager's arrows swap. Both flips are `:dir(rtl)` rules, which follow the `dir` attribute
 * only when the build keeps `:dir()` (issue-00007).
 */
export const RightToLeft: Story = {
  render: () => (
    <div dir='rtl'>
      <TreeGrid pageSize={1} />
    </div>
  ),
  play: async ({ canvas }) => {
    const chevron = (await canvas.findAllByRole('button', { name: /^Expand / }))[0]!.querySelector(
      'svg'
    )!
    // `rotate(90deg)` in RTL; `rotate(-90deg)` in LTR.
    // The end state of a 200 ms transition (the default 10 s wait covers a loaded runner, issue-00009).
    await waitFor(async () => {
      await expect(chevron.getAnimations()).toHaveLength(0)
      await expect(turn(chevron).b).toBeCloseTo(1)
    })
    // An expanded row points down in both directions.
    await userEvent.click(chevron.closest('button')!)
    const open = (await canvas.findAllByRole('button', { name: /^Collapse / }))[0]!.querySelector(
      'svg'
    )!
    // `rotate(0deg)` once the transition has ended; both matrix terms are read in one wait so a
    // reading taken mid-transition cannot pass on one and fail on the other (WebKit, under load).
    await waitFor(async () => {
      await expect(open.getAnimations()).toHaveLength(0)
      await expect(turn(open).b).toBeCloseTo(0)
      await expect(turn(open).a).toBeCloseTo(1)
    })
    // `rotate(180deg)`: previous and next swap sides of the arrow glyphs.
    for (const name of [/go to previous page/i, /go to next page/i]) {
      const arrow = turn(canvas.getByRole('button', { name }))
      await expect(arrow.a).toBeCloseTo(-1)
      await expect(arrow.d).toBeCloseTo(-1)
    }
  }
}

/** Every style rule inside a `prefers-reduced-motion` media query that applies to the element. */
function reducedMotionRules(element: Element) {
  const found: CSSStyleRule[] = []
  const walk = (rules: CSSRuleList, reduced: boolean) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (reduced && element.matches(rule.selectorText)) found.push(rule)
      } else if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, reduced || rule.conditionText.includes('prefers-reduced-motion'))
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, reduced)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false)
  return found
}

/** The expand chevron turns with a transition, and a user who asks for reduced motion gets none. */
export const Motion: Story = {
  render: () => <TreeGrid pageSize={1} />,
  play: async ({ canvas }) => {
    const chevron = (await canvas.findAllByRole('button', { name: /^Expand / }))[0]!.querySelector(
      'svg'
    )!
    const style = getComputedStyle(chevron)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await expect(style.transitionProperty).toBe(reduce ? 'none' : 'transform')

    // A play cannot emulate the media feature, so assert the shipped rule: under
    // `prefers-reduced-motion: reduce` the chevron's transition property is `none`.
    const rules = reducedMotionRules(chevron)
    await expect(rules.some((rule) => rule.style.transitionProperty === 'none')).toBe(true)
  }
}

/** Tree story header uses the real column header component. */
function DataGridColumnHeaderInline({
  table,
  title,
  column
}: {
  table: DataGridTableInstance<ITreeNode>
  title: string
  column: Column<DataGridFeatures, ITreeNode>
}) {
  return <DataGridColumnHeader table={table} title={title} column={column} />
}
