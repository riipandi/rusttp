import { Plus, Search } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { useTable } from '@tanstack/react-table'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import { useMemo, useRef, useState } from 'react'
import { expect, screen, userEvent, waitFor } from 'storybook/test'
import {
  DataGrid,
  DataGridCellSelection,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
  dataGridFeatures,
  type DataGridCellsChangeDetails,
  type DataGridCellStatus,
  type DataGridFeatures,
  type DataGridRowStatus
} from '../'
import { Button } from '../../base/button'
import { pressUntil } from '../../contracts/keyboard'
import { Badge } from '../../extra/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../extra/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../extra/input-group'
import { unit } from '../../styles/tokens.stylex'
import { demoData, type IBook } from './_mocks'
import { stackStyles as s } from './_mocks.stylex'

const meta = {
  title: 'Data Grid/Editing',
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

type Story = StoryObj<typeof meta>
export default meta

/* ------------------------------------------------------------------ */
/* Shared styles */
/* ------------------------------------------------------------------ */

const editingStyles = stylex.create({
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBlock: unit.x3,
    paddingInline: unit.x5
  },
  searchGroup: { width: 192 },
  cardBody: { padding: 0 },
  // Breathing room against the container edges (edgeCell: first
  // ps-4 / last pe-4; a symmetric inline padding reads the same on fixed
  // columns and stays within StyleXStyles' static-only shape).
  edgeCell: { paddingInline: unit.x5 },
  right: {
    display: 'block',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    width: '100%'
  },
  frame: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    paddingBlock: unit.x3,
    width: '100%'
  },
  frameHeader: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x3,
    justifyContent: 'space-between',
    paddingBlock: unit.x3,
    paddingInline: unit.x5
  },
  frameFooter: { paddingBlock: unit.x3 },
  // Spreadsheet card chrome: the hint (header) and pagination (footer) are
  // stack children of a full-bleed table, so their inline padding matches
  // the grid's edgeCell inset.
  hint: {
    paddingBlockStart: unit.x3,
    paddingInline: unit.x5
  },
  bar: {
    paddingBlockEnd: unit.x3,
    paddingInline: unit.x5
  },
  statusCell: { fontWeight: 500 }
})

/* ------------------------------------------------------------------ */
/* CRUD features */
/* ------------------------------------------------------------------ */

export const CrudFeatures: Story = {
  name: 'CRUD features',
  render: () => {
    const [query, setQuery] = useState('')
    const [draft, setDraft] = useState<IBook | null>(null)
    const rowIdRef = useRef(demoData.length + 1)

    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          header: 'Title',
          cell: ({ row }) => <span {...stylex.props(s.strong)}>{row.original.title}</span>,
          size: 180,
          meta: { autoSize: true }
        },
        {
          accessorKey: 'author',
          header: 'Author',
          size: 200
        },
        {
          accessorKey: 'genre',
          header: 'Genre',
          size: 160
        },
        {
          accessorKey: 'country',
          header: 'Country',
          size: 160
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
          size: 120
        }
      ],
      []
    )
    const filtered = useMemo(
      () =>
        (draft ? [...demoData, draft] : demoData).filter((row) =>
          row.title.toLowerCase().includes(query.toLowerCase())
        ),
      [query, draft]
    )
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 5
    })
    const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: true }])
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: filtered,
      pageCount: Math.ceil(filtered.length / pagination.pageSize),
      getRowId: (row: IBook) => row.id,
      state: { pagination, sorting },
      onPaginationChange: setPagination,
      onSortingChange: setSorting
    })

    return (
      <DataGrid
        table={table}
        recordCount={filtered.length}
        tableStyles={{ edgeCell: editingStyles.edgeCell }}
        onRowCreate={() => {
          const id = String(rowIdRef.current++)
          setDraft({
            ...demoData[0]!,
            id,
            title: 'New novel',
            author: 'Unknown'
          })
        }}
        rowCreateLabel='Add row'
      >
        <Card style={editingStyles.frame}>
          <CardHeader style={editingStyles.toolbar}>
            <InputGroup style={editingStyles.searchGroup}>
              <InputGroupAddon align='inline-start'>
                <Search style={{ height: 16, width: 16 }} />
              </InputGroupAddon>
              <InputGroupInput
                aria-label='Search novels'
                placeholder='Search novels...'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
            <Button
              size='small'
              variant='outline'
              onClick={() => {
                const id = String(rowIdRef.current++)
                setDraft({
                  ...demoData[0]!,
                  id,
                  title: 'New novel',
                  author: 'Unknown'
                })
              }}
            >
              <Plus style={{ height: 16, width: 16 }} />
              Create
            </Button>
          </CardHeader>
          <CardContent style={editingStyles.cardBody}>
            <DataGridContainer>
              <DataGridScrollArea table={table}>
                <DataGridTable aria-label='Novels' table={table} />
              </DataGridScrollArea>
            </DataGridContainer>
          </CardContent>
          <CardFooter style={editingStyles.frameFooter}>
            <DataGridPagination table={table} />
          </CardFooter>
        </Card>
      </DataGrid>
    )
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('textbox', { name: 'Search novels' })).toBeVisible()
  }
}

/* ------------------------------------------------------------------ */
/* CRUD in frame container */
/* ------------------------------------------------------------------ */

export const CrudInFrameContainer: Story = {
  name: 'CRUD in frame container',
  render: () => {
    const [rows, setRows] = useState(demoData)

    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          header: 'Title',
          cell: ({ row }) => <span {...stylex.props(s.strong)}>{row.original.title}</span>,
          size: 180,
          meta: { autoSize: true }
        },
        {
          accessorKey: 'author',
          header: 'Author',
          size: 200
        },
        {
          accessorKey: 'genre',
          header: 'Genre',
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
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 5
    })
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data: rows,
      pageCount: Math.ceil(rows.length / pagination.pageSize),
      getRowId: (row: IBook) => row.id,
      state: { pagination },
      onPaginationChange: setPagination
    })

    return (
      <DataGrid
        table={table}
        recordCount={rows.length}
        tableStyles={{ edgeCell: editingStyles.edgeCell }}
        onRowCreate={() => {
          setRows((old) => [...old, { ...old[0]!, id: String(Date.now()), title: 'New novel' }])
        }}
      >
        {/* The source renders this inside its Frame component; a muted card frame
            carries the same header/content/footer intent here. */}
        <Card style={editingStyles.frame}>
          <CardHeader style={editingStyles.frameHeader}>
            <CardTitle>Catalog</CardTitle>
            <Button size='small' variant='outline'>
              <Plus style={{ height: 16, width: 16 }} />
              New novel
            </Button>
          </CardHeader>
          <CardContent style={editingStyles.cardBody}>
            <DataGridContainer>
              <DataGridScrollArea table={table}>
                <DataGridTable aria-label='Novels' table={table} />
              </DataGridScrollArea>
            </DataGridContainer>
          </CardContent>
          <CardFooter style={editingStyles.frameFooter}>
            <DataGridPagination table={table} />
          </CardFooter>
        </Card>
      </DataGrid>
    )
  }
}

/* ------------------------------------------------------------------ */
/* Spreadsheet editing */
/* ------------------------------------------------------------------ */

interface IProduct {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

const productData: IProduct[] = demoData.slice(0, 8).map((row, index) => ({
  id: row.id,
  name: `${row.title} — ${row.publisher}`,
  category: row.genre,
  price: 49.99 + index * 15,
  stock: 12 + index * 7
}))

const rowMeta: Record<string, DataGridRowStatus | undefined> = {
  '3': 'new',
  '5': 'dirty'
}

export const SpreadsheetEditing: Story = {
  name: 'Spreadsheet editing',
  render: () => {
    const [data, setData] = useState(productData)
    const [dirtyCells, setDirtyCells] = useState<Set<string>>(new Set())

    const columns = useMemo<ColumnDef<DataGridFeatures, IProduct>[]>(
      () => [
        {
          accessorKey: 'id',
          header: 'SKU',
          cell: (info) => <span {...stylex.props(s.muted)}>{String(info.getValue())}</span>,
          enableSorting: false,
          size: 90
        },
        {
          accessorKey: 'title',
          header: 'Product',
          size: 200,
          meta: {
            cellEdit: { control: 'text' },
            autoSize: true
          }
        },
        {
          accessorKey: 'category',
          header: 'Category',
          size: 180,
          meta: {
            cellEdit: { control: 'text' }
          }
        },
        {
          accessorKey: 'price',
          header: 'Price ($)',
          size: 140,
          cell: (info) => (
            <span {...stylex.props(editingStyles.right)}>{Number(info.getValue()).toFixed(2)}</span>
          ),
          meta: {
            cellEdit: {
              parse: (raw) => {
                const value = Number.parseFloat(raw)
                return Number.isNaN(value) ? undefined : value
              }
            }
          }
        },
        {
          accessorKey: 'stock',
          header: 'Stock',
          size: 140,
          cell: (info) => (
            <span {...stylex.props(editingStyles.right)}>{Number(info.getValue())}</span>
          ),
          meta: {
            cellEdit: {
              parse: (raw) => {
                const value = Number.parseInt(raw, 10)
                return Number.isNaN(value) ? undefined : value
              }
            }
          }
        }
      ],
      []
    )
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data,
      getRowId: (row: IProduct) => row.id,
      state: { pagination: { pageIndex: 0, pageSize: 8 } }
    })
    const getCellStatus = (_row: IProduct, columnId: string): DataGridCellStatus | undefined =>
      dirtyCells.has(`${_row.id}:${columnId}`) ? 'dirty' : undefined

    const handleCellsChange = (details: DataGridCellsChangeDetails<IProduct>) => {
      // Immutable write-back; the grid never writes data itself.
      setData((old) => {
        const next = old.map((row) => ({ ...row }))
        for (const change of details.changes) {
          const rowIndex = next.findIndex((candidate) => candidate.id === change.rowId)
          if (rowIndex === -1) continue
          const record = next[rowIndex]
          if (!record) continue
          Object.assign(record, { [change.columnId]: change.value })
        }
        return next
      })
      if (details.changes.length) {
        setDirtyCells((old) => {
          const next = new Set(old)
          for (const change of details.changes) {
            next.add(`${change.rowId}:${change.columnId}`)
          }
          return next
        })
      }
    }

    return (
      <DataGrid
        table={table}
        recordCount={data.length}
        onCellsChange={handleCellsChange}
        getRowStatus={(row) => rowMeta[row.id]}
        getCellStatus={getCellStatus}
        tableStyles={{ edgeCell: editingStyles.edgeCell }}
        tableLayout={{
          dense: true,
          cellSelection: true,
          cellFillHandle: true,
          // The Excel-style solid square inside the selection corner.
          cellFillHandleVariant: 'square',
          cellBorder: true,
          columnsResizable: true,
          columnsPinnable: true
        }}
      >
        <DataGridCellSelection table={table} />
        <Card style={editingStyles.frame}>
          <div {...stylex.props(s.stack)}>
            <span {...stylex.props(s.muted, editingStyles.hint)}>
              Drag, Shift+arrows or Ctrl/Cmd+A to select · type to edit · paste from a spreadsheet
            </span>
            <DataGridContainer>
              <DataGridScrollArea table={table}>
                <DataGridTable aria-label='Novels' table={table} />
              </DataGridScrollArea>
            </DataGridContainer>
            <DataGridPagination table={table} style={editingStyles.bar} />
          </div>
        </Card>
      </DataGrid>
    )
  }
}

const centerOf = (element: Element) => {
  const rect = element.getBoundingClientRect()
  return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }
}

/**
 * Dragging the square at the corner of a selection down fills the rows it reaches with the
 * selection's values (the batch itself is unit-tested in `data-grid-cell-ops.test.ts`).
 */
export const SpreadsheetFill: Story = {
  name: 'Spreadsheet fill',
  render: () => {
    const [data, setData] = useState(productData.slice(0, 5))
    const columns = useMemo<ColumnDef<DataGridFeatures, IProduct>[]>(
      () => [
        { accessorKey: 'id', header: 'SKU', size: 80 },
        { accessorKey: 'name', header: 'Product', size: 260, meta: { cellEdit: {} } },
        { accessorKey: 'category', header: 'Category', size: 140, meta: { cellEdit: {} } }
      ],
      []
    )
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data,
      getRowId: (row: IProduct) => row.id
    })
    const handleCellsChange = (details: DataGridCellsChangeDetails<IProduct>) =>
      setData((old) =>
        old.map((row) => {
          const changes = details.changes.filter((change) => change.rowId === row.id)
          return changes.length
            ? { ...row, ...Object.fromEntries(changes.map((c) => [c.columnId, c.value])) }
            : row
        })
      )
    return (
      <DataGrid
        table={table}
        recordCount={data.length}
        onCellsChange={handleCellsChange}
        tableLayout={{ cellSelection: true, cellFillHandle: true, cellFillHandleVariant: 'square' }}
      >
        <DataGridCellSelection table={table} />
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Novels' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    )
  },
  play: async ({ canvasElement }) => {
    const cellAt = (rowIndex: number, columnId: string) => {
      const row = canvasElement.querySelectorAll('tbody tr')[rowIndex]
      const cell = row?.querySelector(`td[data-col-id="${columnId}"]`)
      if (!(cell instanceof HTMLElement)) throw new Error(`No cell ${rowIndex} ${columnId}`)
      return cell
    }
    const source = productData[0]!.name
    await userEvent.click(cellAt(0, 'name'))
    const handle = await waitFor(() => {
      const found = canvasElement.querySelector('[data-slot="data-grid-cell-fill-handle"]')
      if (!(found instanceof HTMLElement)) throw new Error('No fill handle')
      return found
    })
    const target = cellAt(2, 'name')
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: handle, coords: centerOf(handle) },
      { target, coords: centerOf(target) },
      { keys: '[/MouseLeft]', target, coords: centerOf(target) }
    ])
    // The two rows below take the first row's product, the way a spreadsheet repeats one cell.
    await waitFor(() => expect(cellAt(2, 'name')).toHaveTextContent(source))
    await expect(cellAt(1, 'name')).toHaveTextContent(source)
    await expect(cellAt(3, 'name')).toHaveTextContent(productData[3]!.name)
    // The neighbouring column is outside the selection and is left alone.
    await expect(cellAt(1, 'category')).toHaveTextContent(productData[1]!.category)
    // The selection grew over source plus filled cells.
    await expect(canvasElement.querySelectorAll('td[data-cell-selected]')).toHaveLength(3)
  }
}

/**
 * With cell selection on, the grid is the one Tab stop and rows are not: Enter on the focused cell
 * opens its row (when no editor takes the key), the keyboard twin of clicking the row.
 */
export const RowClickCellSelection: Story = {
  name: 'Row click, cell selection',
  render: () => {
    const [opened, setOpened] = useState('nothing')
    const columns = useMemo<ColumnDef<DataGridFeatures, IProduct>[]>(
      () => [
        { accessorKey: 'id', header: 'SKU', size: 120 },
        { accessorKey: 'name', header: 'Product', size: 200 },
        { accessorKey: 'category', header: 'Category', size: 180 }
      ],
      []
    )
    const data = productData.slice(0, 5)
    const table = useTable({
      features: dataGridFeatures,
      columns,
      data,
      getRowId: (row: IProduct) => row.id
    })
    return (
      <DataGrid
        table={table}
        recordCount={data.length}
        tableLayout={{ cellSelection: true }}
        onRowClick={(row) => setOpened(row.name)}
      >
        <DataGridCellSelection table={table} />
        <span {...stylex.props(s.muted)}>Opened: {opened}</span>
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Products' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    const grid = await canvas.findByRole('grid', { name: 'Products' })
    // The grid holds the Tab stop, so no row carries a tabindex of its own.
    await expect(canvasElement.querySelectorAll('tbody tr[tabindex]')).toHaveLength(0)
    const rows = Array.from(canvasElement.querySelectorAll<HTMLElement>('tbody tr'))
    const second = rows[1]?.children[1]
    if (!(second instanceof HTMLElement)) throw new Error('No cell')
    await userEvent.click(second)
    await waitFor(() => expect(grid).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByText(/^Opened: /)).toHaveTextContent(`Opened: ${productData[1]!.name}`)
    // The press did not also move the focus down: Enter opened the row and stayed on the cell.
    await expect(canvasElement.querySelector('td[data-cell-focused]')).toBe(second)
  }
}

function KeyboardGrid() {
  const [data, setData] = useState(productData.slice(0, 5))
  const columns = useMemo<ColumnDef<DataGridFeatures, IProduct>[]>(
    () => [
      { accessorKey: 'id', header: 'SKU', size: 120, meta: { cellEdit: { control: 'text' } } },
      {
        accessorKey: 'name',
        header: 'Product',
        size: 200,
        meta: { cellEdit: { control: 'text' } }
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 180,
        meta: { cellEdit: { control: 'text' } }
      }
    ],
    []
  )
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    getRowId: (row: IProduct) => row.id
  })
  const handleCellsChange = (details: DataGridCellsChangeDetails<IProduct>) =>
    setData((old) =>
      old.map((row) => {
        const changes = details.changes.filter((change) => change.rowId === row.id)
        return changes.length
          ? { ...row, ...Object.fromEntries(changes.map((c) => [c.columnId, c.value])) }
          : row
      })
    )
  return (
    <DataGrid
      table={table}
      recordCount={data.length}
      onCellsChange={handleCellsChange}
      tableLayout={{ cellSelection: true }}
    >
      <DataGridCellSelection table={table} />
      <DataGridContainer>
        <DataGridScrollArea table={table}>
          <DataGridTable aria-label='Novels' table={table} />
        </DataGridScrollArea>
      </DataGridContainer>
    </DataGrid>
  )
}

/** Arrow keys move the focused cell; Home, End, and the Ctrl or Cmd arrows jump; Enter edits; Delete clears. */
export const Keyboard: Story = {
  render: () => <KeyboardGrid />,
  play: async ({ canvasElement, canvas }) => {
    // With cell selection on, the named table is a grid.
    const grid = canvas.getByRole('grid', { name: 'Novels' })
    const cells = (row: number) =>
      Array.from(canvasElement.querySelectorAll<HTMLElement>('tbody tr')[row]?.children ?? [])
    const focused = () => canvasElement.querySelector('td[data-cell-focused]')
    const at = (row: number, column: number) => {
      const cell = cells(row)[column]
      if (!cell) throw new Error(`No cell at ${row}, ${column}`)
      return cell
    }
    const expectFocus = (row: number, column: number) =>
      waitFor(() => expect(focused()).toBe(at(row, column)))

    // A click puts the grid's one Tab stop on that cell; the grid itself holds DOM focus.
    await userEvent.click(at(0, 0))
    await expectFocus(0, 0)
    await waitFor(() => expect(grid).toHaveFocus())
    await waitFor(() => expect(grid).toHaveAttribute('aria-activedescendant', at(0, 0).id))

    // Arrows step one cell, and stay put at an edge.
    await pressUntil('{ArrowRight}', () => expectFocus(0, 1), {
      when: () => focused() === at(0, 0)
    })
    await pressUntil('{ArrowDown}', () => expectFocus(1, 1), { when: () => focused() === at(0, 1) })
    await pressUntil('{ArrowLeft}', () => expectFocus(1, 0), { when: () => focused() === at(1, 1) })
    await userEvent.keyboard('{ArrowLeft}')
    await expectFocus(1, 0)

    // End and Home jump along the row; Ctrl+Arrow jumps along the column.
    await pressUntil('{End}', () => expectFocus(1, 2))
    await pressUntil('{Home}', () => expectFocus(1, 0))
    await pressUntil('{Control>}{ArrowDown}{/Control}', () => expectFocus(4, 0))
    await pressUntil('{Control>}{ArrowUp}{/Control}', () => expectFocus(0, 0))

    // Tab moves to the next cell, and Shift+Tab back, rather than leaving the grid.
    await pressUntil('{Tab}', () => expectFocus(0, 1), { when: () => focused() === at(0, 0) })
    await pressUntil('{Shift>}{Tab}{/Shift}', () => expectFocus(0, 0), {
      when: () => focused() === at(0, 1)
    })

    // Shift+Arrow grows a selection from the focused cell; Escape clears it.
    await pressUntil('{Shift>}{ArrowRight}{/Shift}', () =>
      expect(canvasElement.querySelectorAll('td[data-cell-selected]').length).toBeGreaterThan(1)
    )
    await pressUntil('{Escape}', () =>
      expect(canvasElement.querySelectorAll('td[data-cell-selected]')).toHaveLength(0)
    )

    // Enter opens the editor on the focused cell; Escape closes it, and Enter then edits and commits.
    await userEvent.click(at(2, 1))
    await expectFocus(2, 1)
    await userEvent.keyboard('{Enter}')
    const editor = await screen.findByRole('textbox')
    await expect(editor).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('textbox')).toBeNull())

    // Delete clears the focused cell through `onCellsChange`.
    await userEvent.click(at(3, 2))
    await expectFocus(3, 2)
    await userEvent.keyboard('{Delete}')
    await waitFor(() => expect(at(3, 2).textContent).toBe(''))
  }
}

/**
 * Where focus shows. A grid that holds focus with no active cell (the first Tab, or after Escape
 * clears the selection) draws the library ring on the table; once a cell is active, the cell's own
 * edge is the indicator and the table draws nothing, so the two never double.
 */
export const Focus: Story = {
  render: () => <KeyboardGrid />,
  play: async ({ canvasElement, canvas }) => {
    const grid = canvas.getByRole('grid', { name: 'Novels' })
    const focused = () => canvasElement.querySelector<HTMLElement>('td[data-cell-focused]')
    const ring = () => {
      const { outlineStyle, outlineWidth, outlineColor } = getComputedStyle(grid)
      return { style: outlineStyle, width: outlineWidth, color: outlineColor }
    }

    // Tab lands on the grid with no active cell: a 2 px solid ring.
    await pressUntil('{Tab}', () => expect(grid).toHaveFocus(), {
      when: () => document.activeElement !== grid
    })
    await expect(grid).not.toHaveAttribute('aria-activedescendant')
    await expect(focused()).toBeNull()
    const entry = ring()
    await expect(entry.style).toBe('solid')
    await expect(entry.width).toBe('2px')

    // One arrow makes a cell active: the table's ring goes, the cell's 1 px edge (the same color)
    // takes over, and `aria-activedescendant` names the cell.
    await pressUntil('{ArrowDown}', () => expect(focused()).not.toBeNull(), {
      when: () => focused() === null
    })
    const cell = focused()!
    await expect(canvasElement.querySelectorAll('td[data-cell-focused]')).toHaveLength(1)
    await waitFor(() => expect(grid).toHaveAttribute('aria-activedescendant', cell.id))
    await expect(ring().style).toBe('none')
    const edge = getComputedStyle(cell, '::before')
    for (const width of [
      edge.borderTopWidth,
      edge.borderInlineEndWidth,
      edge.borderBottomWidth,
      edge.borderInlineStartWidth
    ]) {
      await expect(width).toBe('1px')
    }
    await expect(edge.borderTopStyle).toBe('solid')
    await expect(edge.borderTopColor).toBe(entry.color)

    // Escape clears the selection and the active cell; the grid still holds focus, so the ring is back.
    await pressUntil('{Escape}', () => expect(focused()).toBeNull())
    await expect(grid).toHaveFocus()
    await waitFor(() => expect(ring()).toEqual(entry))
  }
}
