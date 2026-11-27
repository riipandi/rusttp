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
  SortingState,
  TableState
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
  initialColumnOrder: string[] = [],
  initialState?: Partial<TableState<DataGridFeatures>>
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
    initialState,
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
    // The column displaced by the drag settles with dnd-kit's transition: the sortable cell's
    // `transition` is a full shorthand, which is not a valid `transition-property`.
    const displaced = canvasElement.querySelector('th[data-col-id="author"]')
    if (!(displaced instanceof HTMLElement)) throw new Error('No author header')
    await waitFor(() => expect(getComputedStyle(displaced).transitionDuration).toBe('0.2s'))
    await expect(getComputedStyle(displaced).transitionProperty).toBe('transform')
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

/**
 * A draggable column keeps its pinned geometry: the sortable cell's drag style must not replace
 * the offset and width the pinning gives it. (Pinned to the end it is not shown: the draggable
 * table orders its filler column after the end-pinned cells while its `colgroup` orders it before.)
 */
export const DraggablePinnedColumns: Story = {
  name: 'Draggable pinned columns',
  render: () => {
    const tableHolder: { current?: DataGridTableInstance<IBook> } = {}
    const columns = useMemo(
      () =>
        bookColumns(false, () => tableHolder.current!).map((column) => ({
          ...column,
          enableColumnOrdering: true
        })),
      [tableHolder]
    )
    const table = useDemoTable(
      columns,
      5,
      columns.map((column) => column.id ?? ''),
      { columnPinning: { start: ['title', 'author'], end: [] } }
    )
    tableHolder.current = table
    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableLayout={{ columnsDraggable: true, columnsPinnable: true, columnsResizable: true }}
      >
        <div {...stylex.props(s.stack)}>
          <DataGridContainer>
            <DataGridScrollArea table={table}>
              <DataGridTableDnd aria-label='Novels' table={table} handleDragEnd={() => {}} />
            </DataGridScrollArea>
          </DataGridContainer>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  },
  play: async ({ canvas }) => {
    const grid = await canvas.findByRole('table', { name: 'Novels' })
    const cells = (id: string, row: 'thead' | 'tbody') => {
      const cell = grid.querySelector(
        `${row} ${row === 'thead' ? 'th' : 'td'}[data-col-id="${id}"]`
      )
      if (!(cell instanceof HTMLElement)) throw new Error(`No ${row} cell ${id}`)
      return cell
    }
    // The size variables a resize drag updates, which are the widths the cells take.
    const size = (id: string) =>
      Number.parseFloat(grid.style.getPropertyValue(`--header-${id}-size`))
    for (const row of ['thead', 'tbody'] as const) {
      const first = cells('title', row)
      const second = cells('author', row)
      await expect(getComputedStyle(first).position).toBe('sticky')
      await expect(getComputedStyle(first).left).toBe('0px')
      await expect(getComputedStyle(second).position).toBe('sticky')
      // The second pinned column sticks after the first, by the first one's width.
      await expect(Number.parseFloat(getComputedStyle(second).left)).toBeCloseTo(size('title'), 0)
      await expect(first.getBoundingClientRect().width).toBeCloseTo(size('title'), 0)
      await expect(second.getBoundingClientRect().width).toBeCloseTo(size('author'), 0)
    }
    // An unpinned column stays in the flow.
    await expect(getComputedStyle(cells('country', 'thead')).position).not.toBe('sticky')
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

const keyboardResizeColumns: ColumnDef<DataGridFeatures, IBook>[] = [
  { accessorKey: 'title', id: 'title', header: 'Title', size: 240, minSize: 120, maxSize: 400 },
  { accessorKey: 'role', id: 'role', header: 'Genre', size: 160, minSize: 100, maxSize: 220 },
  { accessorKey: 'country', id: 'country', header: 'Country', size: 150 }
]

function KeyboardResizeGrid({
  direction,
  fromDir = false
}: {
  direction: 'ltr' | 'rtl'
  /** Leave `columnResizeDirection` unset: the grid takes the direction from `dir`. */
  fromDir?: boolean
}) {
  const table = useTable({
    features: dataGridFeatures,
    columns: keyboardResizeColumns,
    data: demoData.slice(0, 3),
    getRowId: (row: IBook) => row.id,
    ...(fromDir ? {} : { columnResizeDirection: direction })
  })
  return (
    <div dir={direction}>
      <DataGrid
        table={table}
        recordCount={3}
        tableLayout={{ columnsResizable: true, width: 'fixed' }}
      >
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Novels' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    </div>
  )
}

/** The Genre separator and the width of its header, read live: the keys change both. */
function genreHandle(canvas: {
  getByRole: (role: string, options: { name: string }) => HTMLElement
}) {
  const separator = canvas.getByRole('separator', { name: 'Resize Genre column' })
  const cell = separator.closest('th')
  if (!cell) throw new Error('No header cell')
  return {
    separator,
    value: () => Number(separator.getAttribute('aria-valuenow')),
    width: () => cell.getBoundingClientRect().width
  }
}

/** Drags a separator by `dx` px with the mouse, the way a pointer user resizes a column. */
async function dragBy(separator: HTMLElement, dx: number) {
  const box = separator.getBoundingClientRect()
  const clientX = box.left + box.width / 2
  const clientY = box.top + box.height / 2
  await userEvent.pointer([
    { keys: '[MouseLeft>]', target: separator, coords: { clientX, clientY } },
    { coords: { clientX: clientX + dx, clientY } },
    { keys: '[/MouseLeft]' }
  ])
}

/**
 * A column resizes from the keyboard through its separator: an arrow moves the edge 10 px (50 with
 * Shift), Home and End jump to the limits, Enter restores the default width.
 */
export const ResizeByKeyboard: Story = {
  name: 'Column resizing, keyboard',
  render: () => <KeyboardResizeGrid direction='ltr' />,
  play: async ({ canvas }) => {
    await canvas.findByRole('table', { name: 'Novels' })
    const { separator, value, width } = genreHandle(canvas)
    await expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    await expect(separator).toHaveAttribute('aria-valuemin', '100')
    await expect(separator).toHaveAttribute('aria-valuemax', '220')
    await expect(separator).toHaveAttribute('tabindex', '0')
    // The spoken value is the width in px, and the separator controls the header cell it sizes.
    await expect(separator).toHaveAttribute('aria-valuetext', '160 px')
    const header = separator.closest('th')
    if (!header) throw new Error('No header cell')
    await expect(header.id).not.toBe('')
    await expect(separator).toHaveAttribute('aria-controls', header.id)
    // A column with no `maxSize` still has a maximum: ARIA 1.2 reads a missing one as 100, below its value.
    const country = canvas.getByRole('separator', { name: 'Resize Country column' })
    await expect(country).toHaveAttribute('aria-valuetext', '150 px')
    await expect(Number(country.getAttribute('aria-valuemax'))).toBeGreaterThanOrEqual(
      Number(country.getAttribute('aria-valuenow'))
    )
    await expect(value()).toBe(160)
    await waitFor(() => expect(width()).toBeCloseTo(160, 0))

    const settle = async (to: number) => {
      await expect(value()).toBe(to)
      await expect(width()).toBeCloseTo(to, 0)
    }
    separator.focus()
    await expect(separator).toHaveFocus()

    // An arrow moves 10 px and the header follows; Shift moves 50.
    await pressUntil('{ArrowRight}', () => settle(170), { when: () => value() !== 170 })
    await expect(separator).toHaveAttribute('aria-valuetext', '170 px')
    await pressUntil('{Shift>}{ArrowRight}{/Shift}', () => settle(220), {
      when: () => value() !== 220
    })
    // The maximum holds: another arrow does not pass it.
    await userEvent.keyboard('{ArrowRight}')
    await expect(value()).toBe(220)
    // Home and End jump to the limits, and the minimum holds too.
    await pressUntil('{Home}', () => settle(100), { when: () => value() !== 100 })
    await userEvent.keyboard('{ArrowLeft}')
    await expect(value()).toBe(100)
    await pressUntil('{End}', () => settle(220), { when: () => value() !== 220 })
    // Enter restores the default width, the twin of the double-click.
    await pressUntil('{Enter}', () => settle(160), { when: () => value() !== 160 })
    // The neighbour is untouched.
    await expect(canvas.getByRole('separator', { name: 'Resize Title column' })).toHaveAttribute(
      'aria-valuenow',
      '240'
    )

    // A drag to the right widens the column, the same direction as ArrowRight.
    await dragBy(separator, 40)
    await waitFor(() => expect(value()).toBe(200))
    await waitFor(() => expect(width()).toBeCloseTo(200, 0))
  }
}

const resizeRtlPlay: Story['play'] = async ({ canvas }) => {
  await canvas.findByRole('table', { name: 'Novels' })
  const { separator, value, width } = genreHandle(canvas)
  const cell = separator.closest('th')
  if (!cell) throw new Error('No header cell')
  // The separator sits on the physical left edge of its header: the end edge in right to left.
  const handleMiddle = separator.getBoundingClientRect().left + separator.offsetWidth / 2
  await expect(Math.abs(handleMiddle - cell.getBoundingClientRect().left)).toBeLessThan(4)

  separator.focus()
  await expect(separator).toHaveFocus()
  await pressUntil('{ArrowLeft}', () => expect(value()).toBe(170), {
    when: () => value() !== 170
  })
  await waitFor(() => expect(width()).toBeCloseTo(170, 0))
  await pressUntil('{ArrowRight}', () => expect(value()).toBe(160), {
    when: () => value() !== 160
  })
  await waitFor(() => expect(width()).toBeCloseTo(160, 0))

  // The pointer agrees with the keys: dragging the edge to the left widens the column.
  await dragBy(separator, -40)
  await waitFor(() => expect(value()).toBe(200))
  await waitFor(() => expect(width()).toBeCloseTo(200, 0))
}

/**
 * Right to left, with the table option also set (the grid ignores it): the end edge is on the left,
 * so the arrow that points left widens, the same direction a drag takes.
 */
export const ResizeByKeyboardRtl: Story = {
  name: 'Column resizing, keyboard, right to left',
  render: () => <KeyboardResizeGrid direction='rtl' />,
  play: resizeRtlPlay
}

/**
 * Right to left from `dir` alone: with no `columnResizeDirection`, the same keys and the same drag
 * apply, because the grid reads the direction the handle is laid out in.
 */
export const ResizeByKeyboardRtlFromDir: Story = {
  name: 'Column resizing, keyboard, right to left from dir',
  render: () => <KeyboardResizeGrid direction='rtl' fromDir />,
  play: resizeRtlPlay
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
