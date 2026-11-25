import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { useTable } from '@tanstack/react-table'
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState
} from '@tanstack/react-table'
import { useMemo, useRef, useState } from 'react'
import { expect, within } from 'storybook/test'
import {
  DataGrid,
  DataGridCellSelection,
  DataGridColumnHeader,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
  DataGridTableFootRow,
  DataGridTableFootRowCell,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
  dataGridFeatures,
  type DataGridCellsChangeDetails,
  type DataGridFeatures,
  type DataGridTableInstance
} from '../'
import { Skeleton } from '../../extra/skeleton'
import { demoData, type IBook } from './_mocks'
import { stackStyles as s } from './_mocks.stylex'

const meta = {
  title: 'Data Grid/Playground',
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

export default meta

// The grid takes one `tableLayout` object; the Playground flattens it into one control per flag.
interface PlaygroundArgs {
  dense: boolean
  cellBorder: boolean
  rowBorder: boolean
  stripped: boolean
  headerBackground: boolean
  headerBorder: boolean
  headerSticky: boolean
  width: 'auto' | 'fixed'
  columnsResizable: boolean
  columnsPinnable: boolean
  columnsMovable: boolean
  columnsVisibility: boolean
  cellSelection: boolean
  cellSelectionMode: 'single' | 'range'
  cellFillHandle: boolean
  cellFillHandleVariant: 'dot' | 'ring' | 'square'
  cellEditMode: 'dblclick' | 'click'
  cellEditEnterAdvance: boolean
  columnsResizeMode: 'onChange' | 'onEnd'
  footerBackground: boolean
  cellEditable: boolean
  isLoading: boolean
  loadingMode: 'skeleton' | 'spinner'
  empty: boolean
  pagination: boolean
  pageSize: number
  rowSelection: boolean
}

// A footer row, so `footerBackground` has something to fill.
function PlaygroundFooter({ table }: { table: DataGridTableInstance<IBook> }) {
  const visible = table.getVisibleLeafColumns().length
  return (
    <DataGridTableFootRow table={table}>
      <DataGridTableFootRowCell colSpan={visible}>
        {demoData.length} books in the Restricted Section
      </DataGridTableFootRowCell>
    </DataGridTableFootRow>
  )
}

function PlaygroundGrid({
  dense,
  cellBorder,
  rowBorder,
  stripped,
  headerBackground,
  headerBorder,
  headerSticky,
  width,
  columnsResizable,
  columnsPinnable,
  columnsMovable,
  columnsVisibility,
  cellSelection,
  cellSelectionMode,
  cellFillHandle,
  cellFillHandleVariant,
  cellEditMode,
  cellEditEnterAdvance,
  columnsResizeMode,
  footerBackground,
  cellEditable,
  isLoading,
  loadingMode,
  empty,
  pagination: paged,
  pageSize,
  rowSelection: selectable
}: PlaygroundArgs) {
  // The grid never writes data itself: edits, pastes, and fills come back through `onCellsChange`.
  // The render remounts the grid when `empty` changes, so this state starts from the right set.
  const [data, setData] = useState<IBook[]>(() => (empty ? [] : demoData))
  const handleCellsChange = (details: DataGridCellsChangeDetails<IBook>) =>
    setData((old) =>
      old.map((row) => {
        const changes = details.changes.filter((change) => change.rowId === row.id)
        return changes.length === 0
          ? row
          : Object.assign(
              { ...row },
              ...changes.map((change) => ({ [change.columnId]: change.value }))
            )
      })
    )
  // Without the pager, one page holds every row.
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: paged ? pageSize : Math.max(data.length, 1)
  })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: false }])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // The header cells need the table they belong to, which only exists after `useTable`.
  const tableRef = useRef<DataGridTableInstance<IBook> | undefined>(undefined)
  const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(() => {
    const getTable = () => {
      if (!tableRef.current) throw new Error('table not ready')
      return tableRef.current
    }
    const skeleton = <Skeleton width='70%' height={4} />
    // `cellEdit` marks a text column writable: the built-in editor, paste, fill, and clear use it.
    const editable = cellEditable ? { cellEdit: { control: 'text' as const } } : {}
    return [
      ...(selectable
        ? [
            {
              id: 'select',
              meta: { headerTitle: 'Select all' },
              size: 40,
              header: () => <DataGridTableRowSelectAll table={getTable()} />,
              cell: ({ row }) => <DataGridTableRowSelect row={row} />
            } satisfies ColumnDef<DataGridFeatures, IBook>
          ]
        : []),
      {
        accessorKey: 'title',
        id: 'title',
        header: ({ column }) => (
          <DataGridColumnHeader table={getTable()} title='Title' column={column} />
        ),
        cell: (info) => <span {...stylex.props(s.strong)}>{String(info.getValue())}</span>,
        size: 220,
        enableHiding: false,
        meta: { skeleton, ...editable }
      },
      {
        accessorKey: 'author',
        id: 'author',
        header: ({ column }) => (
          <DataGridColumnHeader table={getTable()} title='Author' column={column} />
        ),
        size: 160,
        meta: { skeleton, ...editable }
      },
      {
        accessorKey: 'country',
        id: 'country',
        header: ({ column }) => (
          <DataGridColumnHeader table={getTable()} title='Country' column={column} />
        ),
        size: 150,
        meta: { skeleton, ...editable }
      },
      {
        accessorKey: 'price',
        id: 'price',
        header: ({ column }) => (
          <DataGridColumnHeader table={getTable()} title='Price ($)' column={column} />
        ),
        cell: (info) => <>${Number(info.getValue()).toFixed(2)}</>,
        size: 110,
        meta: { skeleton }
      }
    ]
  }, [selectable, cellEditable])

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    getRowId: (row: IBook) => row.id,
    state: { pagination, sorting, rowSelection },
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting
  })
  tableRef.current = table

  return (
    <DataGrid
      table={table}
      recordCount={data.length}
      onCellsChange={handleCellsChange}
      isLoading={isLoading}
      loadingMode={loadingMode}
      emptyMessage='No books in the Restricted Section'
      tableLayout={{
        dense,
        cellBorder,
        rowBorder,
        stripped,
        headerBackground,
        headerBorder,
        headerSticky,
        width,
        columnsResizable,
        columnsPinnable,
        columnsMovable,
        columnsVisibility,
        cellSelection,
        cellSelectionMode,
        cellFillHandle,
        cellFillHandleVariant,
        cellEditMode,
        cellEditEnterAdvance,
        columnsResizeMode,
        footerBackground
      }}
    >
      {cellSelection && <DataGridCellSelection table={table} />}
      <div {...stylex.props(s.stack)}>
        <DataGridContainer>
          {/* Sticky needs vertical overflow to scroll, so it gets a fixed viewport height. */}
          <DataGridScrollArea
            table={table}
            style={headerSticky ? atoms.height['384px'] : undefined}
          >
            <DataGridTable
              aria-label='Novels'
              table={table}
              footerContent={footerBackground ? <PlaygroundFooter table={table} /> : undefined}
            />
          </DataGridScrollArea>
        </DataGridContainer>
        {paged && <DataGridPagination table={table} />}
      </div>
    </DataGrid>
  )
}

const boolean = (category: string) => ({ control: 'boolean', table: { category } }) as const

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      disable: false,
      include: [
        'dense',
        'cellBorder',
        'rowBorder',
        'stripped',
        'headerBackground',
        'headerBorder',
        'headerSticky',
        'width',
        'columnsResizable',
        'columnsPinnable',
        'columnsMovable',
        'columnsVisibility',
        'cellSelection',
        'cellSelectionMode',
        'cellEditable',
        'cellEditMode',
        'cellEditEnterAdvance',
        'cellFillHandle',
        'cellFillHandleVariant',
        'columnsResizeMode',
        'footerBackground',
        'isLoading',
        'loadingMode',
        'empty',
        'pagination',
        'pageSize',
        'rowSelection'
      ]
    }
  },
  argTypes: {
    dense: boolean('Layout'),
    cellBorder: boolean('Layout'),
    rowBorder: boolean('Layout'),
    stripped: boolean('Layout'),
    headerBackground: boolean('Layout'),
    headerBorder: boolean('Layout'),
    headerSticky: boolean('Layout'),
    width: { control: 'radio', options: ['auto', 'fixed'], table: { category: 'Layout' } },
    columnsResizable: boolean('Columns'),
    columnsPinnable: boolean('Columns'),
    columnsMovable: boolean('Columns'),
    columnsVisibility: boolean('Columns'),
    rowSelection: boolean('Rows'),
    pagination: boolean('Rows'),
    pageSize: { control: 'radio', options: [5, 10], table: { category: 'Rows' } },
    cellSelection: boolean('Cells'),
    cellSelectionMode: {
      control: 'radio',
      options: ['single', 'range'],
      table: { category: 'Cells' }
    },
    cellEditable: boolean('Cells'),
    cellEditMode: {
      control: 'radio',
      options: ['dblclick', 'click'],
      table: { category: 'Cells' }
    },
    cellEditEnterAdvance: boolean('Cells'),
    cellFillHandle: boolean('Cells'),
    cellFillHandleVariant: {
      control: 'radio',
      options: ['dot', 'ring', 'square'],
      table: { category: 'Cells' }
    },
    columnsResizeMode: {
      control: 'radio',
      options: ['onEnd', 'onChange'],
      table: { category: 'Columns' }
    },
    footerBackground: boolean('Layout'),
    isLoading: boolean('State'),
    loadingMode: {
      control: 'radio',
      options: ['skeleton', 'spinner'],
      table: { category: 'State' }
    },
    empty: boolean('State')
  },
  args: {
    dense: false,
    cellBorder: false,
    rowBorder: true,
    stripped: false,
    headerBackground: false,
    headerBorder: true,
    headerSticky: false,
    width: 'fixed',
    columnsResizable: false,
    columnsPinnable: false,
    columnsMovable: false,
    columnsVisibility: false,
    cellSelection: false,
    cellSelectionMode: 'range',
    cellEditable: false,
    cellEditMode: 'dblclick',
    cellEditEnterAdvance: false,
    cellFillHandle: false,
    cellFillHandleVariant: 'dot',
    columnsResizeMode: 'onEnd',
    footerBackground: false,
    isLoading: false,
    loadingMode: 'skeleton',
    empty: false,
    pagination: true,
    pageSize: 5,
    rowSelection: false
  },
  // The grid reads its page size and data once, so the render remounts it when they change.
  render: (args) => (
    <PlaygroundGrid
      key={`${args.pagination}-${args.pageSize}-${args.empty}-${args.rowSelection}-${args.cellEditable}`}
      {...args}
    />
  ),
  play: async ({ canvas }) => {
    // The default args page five books: the header row and five rows.
    await expect(within(canvas.getByRole('table')).getAllByRole('row')).toHaveLength(6)
  }
}
