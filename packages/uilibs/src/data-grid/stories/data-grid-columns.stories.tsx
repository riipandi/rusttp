import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Mail, MapPin, User, Wallet } from '@keyline-icons/react'
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { useTable } from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnOrderState,
  PaginationState,
  SortingState
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
  DataGridTableDnd,
  dataGridFeatures,
  type DataGridTableInstance,
  type DataGridFeatures
} from '../'
import { Avatar, AvatarFallback } from '../../base/avatar'
import { pressUntil } from '../../contracts/keyboard'
import { CountryFlag, demoData, type IBook } from './_mocks'
import { stackStyles as s } from './_mocks.stylex'

const meta = {
  title: 'Data Grid/Columns',
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

/** What dnd-kit's live region says: the keyboard drag announcement a screen reader hears. */
const live = () => document.querySelector('[id^="DndLiveRegion"]')?.textContent ?? ''

function useDemoTable(
  columns: ColumnDef<DataGridFeatures, IBook>[],
  pageSize = 5,
  initialColumnOrder: string[] = []
) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize
  })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: true }])
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialColumnOrder)

  return useTable({
    features: dataGridFeatures,
    columns,
    data: demoData,
    pageCount: Math.ceil((demoData?.length || 0) / pageSize),
    getRowId: (row: IBook) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder
  })
}

function AvatarCell({ row }: { row: IBook }) {
  return (
    <div {...stylex.props(s.cellFlexWide)}>
      <Avatar style={s.avatar32}>
        <AvatarFallback>{row.initials}</AvatarFallback>
      </Avatar>
      <div {...stylex.props(s.nameStack)}>
        <div {...stylex.props(s.strong)}>{row.title}</div>
        <div {...stylex.props(s.muted)}>{row.author}</div>
      </div>
    </div>
  )
}

function bookColumns(
  withIcons: boolean,
  getTable: () => DataGridTableInstance<IBook>
): ColumnDef<DataGridFeatures, IBook>[] {
  const iconStyle = stylex.create({ icon: { height: 14, width: 14 } })
  const icon = (node: React.ReactNode) => <span {...stylex.props(iconStyle.icon)}>{node}</span>
  return [
    {
      accessorKey: 'title',
      id: 'title',
      header: ({ column }) =>
        withIcons ? (
          <DataGridColumnHeader
            table={getTable()}
            title='Title'
            column={column}
            icon={icon(<User />)}
          />
        ) : (
          <DataGridColumnHeader table={getTable()} title='Title' column={column} />
        ),
      cell: ({ row }) => <AvatarCell row={row.original} />,
      size: 200,
      meta: { autoSize: true },
      enableSorting: true,
      enableHiding: false
    },
    {
      accessorKey: 'author',
      id: 'author',
      header: ({ column }) =>
        withIcons ? (
          <DataGridColumnHeader
            table={getTable()}
            title='Author'
            column={column}
            icon={icon(<Mail />)}
          />
        ) : (
          <DataGridColumnHeader table={getTable()} title='Author' column={column} />
        ),
      size: 160,
      enableSorting: true,
      enableHiding: false
    },
    {
      accessorKey: 'country',
      id: 'country',
      header: ({ column }) =>
        withIcons ? (
          <DataGridColumnHeader
            table={getTable()}
            title='Country'
            column={column}
            icon={icon(<MapPin />)}
          />
        ) : (
          <DataGridColumnHeader table={getTable()} title='Country' column={column} />
        ),
      cell: ({ row }) => (
        <div {...stylex.props(s.cellFlex)}>
          <CountryFlag code={row.original.flag} title={row.original.country} style={s.flag} />
          <div {...stylex.props(s.strong)}>{row.original.country}</div>
        </div>
      ),
      size: 150,
      enableSorting: false
    },
    {
      accessorKey: 'price',
      id: 'price',
      header: ({ column }) =>
        withIcons ? (
          <DataGridColumnHeader
            table={getTable()}
            title='Price'
            column={column}
            icon={icon(<Wallet />)}
          />
        ) : (
          <DataGridColumnHeader table={getTable()} title='Price' column={column} />
        ),
      cell: (info) => <>${Number(info.getValue()).toFixed(2)}</>,
      size: 120,
      enableSorting: true,
      enableHiding: false
    }
  ]
}

/** Column icons. */
export const ColumnIcons: Story = {
  name: 'Column icons',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(() => bookColumns(true, () => tableHolder.current!), [tableHolder])
    const table = useDemoTable(columns)
    tableHolder.current = table

    return (
      <DataGrid table={table} recordCount={demoData?.length || 0}>
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Sortable columns. */
export const SortableColumns: Story = {
  name: 'Sortable columns',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(() => bookColumns(false, () => tableHolder.current!), [tableHolder])
    const table = useDemoTable(columns)
    tableHolder.current = table

    return (
      <DataGrid table={table} recordCount={demoData?.length || 0}>
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Movable columns via the header menu. */
export const MovableColumns: Story = {
  name: 'Movable columns',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(() => bookColumns(false, () => tableHolder.current!), [tableHolder])
    const table = useDemoTable(columns)
    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{ columnsMovable: true }}
      >
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Draggable columns via dnd-kit. */
export const DraggableColumns: Story = {
  name: 'Draggable columns',
  render: () => {
    const columns = useMemo(
      () =>
        bookColumns(false, () => table).map((column) => ({
          ...column,
          enableColumnOrdering: true
        })),
      []
    )
    const table = useDemoTable(
      columns,
      5,
      columns.map((column) => column.id ?? '')
    )
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event
      if (active && over && active.id !== over.id) {
        table.setColumnOrder((columnOrder) => {
          const oldIndex = columnOrder.indexOf(String(active.id))
          const newIndex = columnOrder.indexOf(String(over.id))
          return arrayMove(columnOrder, oldIndex, newIndex)
        })
      }
    }

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{ columnsDraggable: true }}
      >
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTableDnd aria-label='Novels' table={table} handleDragEnd={handleDragEnd} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  },
  // Each header's grip is named after its column, not four identical "Drag to reorder". These
  // headers are components, so the name falls back to the column id (`meta.headerTitle` sets it).
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole('table', { name: 'Novels' })
    const names = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[aria-label^="Drag to reorder "]')
    ).map((el) => el.getAttribute('aria-label') ?? '')
    await expect(names.length).toBeGreaterThan(1)
    await expect(new Set(names).size).toBe(names.length)
    await expect(names.every((name) => name.endsWith(' column'))).toBe(true)
    await expect(canvas.getByRole('button', { name: 'Drag to reorder title column' })).toBeVisible()

    // A keyboard drag speaks the column's name, never dnd-kit's "draggable item".
    const grip = () => canvas.getByRole('button', { name: 'Drag to reorder title column' })
    grip().focus()
    await pressUntil(' ', () => expect(live()).toBe('Picked up title.'), {
      when: () => live() !== 'Picked up title.'
    })
    await pressUntil('{ArrowRight}', () => expect(live()).toBe('title moved over author.'), {
      when: () => live() !== 'title moved over author.'
    })
    await pressUntil(' ', () => expect(live()).toBe('title dropped over author.'), {
      when: () => live() !== 'title dropped over author.'
    })
    await waitFor(() => expect(grip()).toBeVisible())
    grip().focus()
    await pressUntil(' ', () => expect(live()).toBe('Picked up title.'), {
      when: () => live() !== 'Picked up title.'
    })
    await pressUntil('{Escape}', () =>
      expect(live()).toBe('Dragging cancelled. title returned to its place.')
    )
  }
}

/** Column resizing. */
export const ColumnResizing: Story = {
  name: 'Column resizing',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const getTable = () => {
      if (!tableHolder.current) throw new Error('table not ready')
      return tableHolder.current
    }
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Title' column={column} />
          ),
          cell: ({ row }) => <AvatarCell row={row.original} />,
          size: 400,
          minSize: 300,
          meta: { autoSize: true },
          enableSorting: true,
          enableHiding: false,
          enableResizing: true
        },
        {
          accessorKey: 'role',
          id: 'role',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Genre' column={column} />
          ),
          size: 200,
          enableResizing: true
        },
        {
          accessorKey: 'availability',
          id: 'availability',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Status' column={column} />
          ),
          size: 200,
          enableResizing: true
        }
      ],
      []
    )
    const table = useDemoTable(columns)

    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{ columnsResizable: true }}
      >
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** A resizable column that cannot sort draws a plain label, and a click on it sorts nothing. */
export const ResizableNotSortable: Story = {
  name: 'Resizable, not sortable',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const getTable = () => {
      if (!tableHolder.current) throw new Error('table not ready')
      return tableHolder.current
    }
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Title' column={column} />
          ),
          size: 300,
          enableSorting: true,
          enableResizing: true
        },
        {
          accessorKey: 'role',
          id: 'role',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Genre' column={column} />
          ),
          size: 200,
          enableSorting: false,
          enableResizing: true
        }
      ],
      []
    )
    const table = useDemoTable(columns)

    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{ columnsResizable: true }}
      >
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Novels' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    )
  },
  play: async ({ canvas }) => {
    const genre = (await canvas.findByText('Genre')).closest('th')!
    const title = (await canvas.findByText('Title')).closest('th')!
    await expect(title).toHaveAttribute('aria-sort', 'descending')
    // A click on the non-sortable header sorts nothing: no column takes its place.
    await userEvent.click(canvas.getByText('Genre'))
    await expect(genre).not.toHaveAttribute('aria-sort')
    await expect(title).toHaveAttribute('aria-sort', 'descending')
    // The sortable header is a button; the other is a plain label.
    await expect(title.querySelector('button')).not.toBeNull()
    await expect(genre.querySelector('button')).toBeNull()
  }
}

/** Pinnable columns. */
export const PinnableColumns: Story = {
  name: 'Pinnable columns',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(() => bookColumns(false, () => tableHolder.current!), [tableHolder])
    const table = useDemoTable(columns)
    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{ columnsPinnable: true, columnsResizable: true }}
      >
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Sticky header. */
export const StickyHeader: Story = {
  name: 'Sticky header',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(() => bookColumns(false, () => tableHolder.current!), [tableHolder])
    const table = useDemoTable(columns, 10)
    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{ headerSticky: true }}
      >
        <div {...stylex.props(s.stack)}>
          {/* Fixed viewport height: sticky needs vertical overflow to scroll. */}
          <DataGridContainer>
            <DataGridScrollArea table={table} style={atoms.height['384px']}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Column controls. */
export const ColumnControls: Story = {
  name: 'Column controls',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(() => bookColumns(false, () => tableHolder.current!), [tableHolder])
    const table = useDemoTable(columns)
    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{
          columnsPinnable: true,
          columnsResizable: true,
          columnsMovable: true,
          columnsVisibility: true
        }}
      >
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Column visibility controls. */
export const ColumnVisibilityControls: Story = {
  name: 'Column visibility controls',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const getTable = () => {
      if (!tableHolder.current) throw new Error('table not ready')
      return tableHolder.current
    }
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Title' visibility column={column} />
          ),
          cell: ({ row }) => <AvatarCell row={row.original} />,
          minSize: 200,
          meta: { autoSize: true },
          enableSorting: true,
          enableHiding: false,
          enableResizing: true
        },
        {
          accessorKey: 'country',
          id: 'country',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Country' visibility column={column} />
          ),
          size: 175,
          enableHiding: false
        },
        {
          accessorKey: 'genre',
          id: 'genre',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Genre' visibility column={column} />
          ),
          size: 150
        },
        {
          accessorKey: 'price',
          id: 'price',
          header: ({ column }) => (
            <DataGridColumnHeader table={getTable()} title='Price' visibility column={column} />
          ),
          size: 120
        }
      ],
      []
    )
    const table = useDemoTable(columns)

    tableHolder.current = table

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{
          columnsPinnable: true,
          columnsResizable: true,
          columnsMovable: true,
          columnsVisibility: true
        }}
      >
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTable aria-label='Novels' table={table} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}
