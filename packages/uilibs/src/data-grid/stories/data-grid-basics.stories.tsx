import type { Meta, StoryObj } from '@storybook/tanstack-react'
import atoms from '@stylexjs/atoms'
import * as stylex from '@stylexjs/stylex'
import { useTable } from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnOrderState,
  OnChangeFn,
  PaginationState,
  SortingState
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { expect, within } from 'storybook/test'
import {
  DataGrid,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
  dataGridFeatures,
  type DataGridFeatures
} from '../'
import { Avatar, AvatarFallback } from '../../base/avatar'
import { Card } from '../../extra/card'
import { CountryFlag, demoData, type IBook } from './_mocks'
import { stackStyles as s } from './_mocks.stylex'

const meta = {
  title: 'Data Grid/Basics',
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

function useDemoTable(
  columns: ColumnDef<DataGridFeatures, IBook>[],
  columnOrderState?: {
    columnOrder?: ColumnOrderState
    onColumnOrderChange?: OnChangeFn<ColumnOrderState>
  }
) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5
  })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: true }])

  return useTable({
    features: dataGridFeatures,
    columns,
    data: demoData,
    pageCount: Math.ceil((demoData?.length || 0) / pagination.pageSize),
    getRowId: (row: IBook) => row.id,
    state: {
      pagination,
      sorting,
      ...columnOrderState
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    ...columnOrderState
  })
}

const AvatarCell = ({ row }: { row: IBook & { initials: string } }) => (
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

const AvatarLinkCell = ({ row }: { row: IBook & { initials: string } }) => (
  <div {...stylex.props(s.cellFlex)}>
    <Avatar style={s.avatar24}>
      <AvatarFallback>{row.initials}</AvatarFallback>
    </Avatar>
    <a href={`#${row.id}`} {...stylex.props(s.link, s.strong)}>
      {row.title}
    </a>
  </div>
)

const balanceCell = (info: { getValue: () => unknown }) => (
  <>${Number(info.getValue()).toFixed(2)}</>
)

/** Pagination. */
export const Pagination: Story = {
  parameters: {
    docs: {
      source: {
        code: `const table = useTable({
  features: dataGridFeatures,
  columns,
  data,
  getRowId: (row) => row.id,
  state: { pagination, sorting },
  onPaginationChange: setPagination,
  onSortingChange: setSorting
})

<DataGrid table={table} recordCount={data.length}>
  <DataGridContainer>
    <DataGridScrollArea table={table}>
      <DataGridTable aria-label='Novels' table={table} />
    </DataGridScrollArea>
  </DataGridContainer>
  <DataGridPagination table={table} />
</DataGrid>`
      }
    }
  },
  name: 'Pagination',
  render: () => {
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          header: 'Title',
          cell: (info) => <>{String(info.getValue())}</>,
          size: 150
        },
        {
          accessorKey: 'author',
          header: 'Author',
          cell: (info) => (
            <div {...stylex.props(s.truncate)}>
              <a href={`mailto:${String(info.getValue())}`} {...stylex.props(s.link, s.truncate)}>
                {String(info.getValue())}
              </a>
            </div>
          ),
          size: 150
        },
        {
          accessorKey: 'country',
          header: 'Country',
          cell: ({ row }) => (
            <div {...stylex.props(s.cellFlex)}>
              <CountryFlag code={row.original.flag} title={row.original.country} style={s.flag} />
              <div>{row.original.country}</div>
            </div>
          ),
          size: 175
        },
        {
          accessorKey: 'price',
          header: 'Price ($)',
          cell: balanceCell,
          size: 100,
          meta: {
            headerStyle: s.textEnd,
            cellStyle: s.textEnd
          }
        }
      ],
      []
    )
    const table = useDemoTable(columns)

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
  },
  play: async ({ canvas }) => {
    // A plain table is named by `aria-label`, so a screen reader says which table it is on.
    await expect(await canvas.findByRole('table', { name: 'Novels' })).toBeVisible()
    // The page buttons are one named navigation; the page-size select and the range text are not in it.
    const pages = within(await canvas.findByRole('navigation', { name: 'Pagination' }))
    await expect(pages.getByRole('button', { name: 'Go to page 2' })).toBeVisible()
    await expect(pages.getByRole('button', { name: 'Go to next page' })).toBeVisible()
    await expect(pages.queryByRole('combobox')).toBeNull()
    await expect(pages.queryByText(/of 10/)).toBeNull()
  }
}

/** Cell border. */
export const CellBorder: Story = {
  name: 'Cell border',
  render: () => {
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: 'Title',
          cell: ({ row }) => <AvatarCell row={row.original} />,
          size: 250,
          enableSorting: true,
          enableHiding: false
        },
        {
          accessorKey: 'publisher',
          header: 'Publisher',
          size: 100
        },
        {
          accessorKey: 'role',
          header: 'Genre',
          size: 100
        },
        {
          accessorKey: 'price',
          header: 'Price',
          cell: (info) => (
            <span {...stylex.props(s.salary)}>${Number(info.getValue()).toFixed(2)}</span>
          ),
          size: 100
        }
      ],
      []
    )
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([])
    const table = useDemoTable(columns, {
      columnOrder,
      onColumnOrderChange: setColumnOrder
    })

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableStyles={{ edgeCell: s.edgeCell }}
        tableLayout={{ cellBorder: true }}
      >
        <div {...stylex.props(s.stack)}>
          <Card style={s.cardFlush}>
            <DataGridContainer>
              <DataGridScrollArea table={table}>
                <DataGridTable aria-label='Novels' table={table} />
              </DataGridScrollArea>
            </DataGridContainer>
          </Card>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Dense layout. */
export const DenseLayout: Story = {
  parameters: {
    docs: {
      source: {
        code: `<DataGrid table={table} recordCount={data.length} tableLayout={{ dense: true }}>
  <DataGridContainer>
    <DataGridScrollArea table={table}>
      <DataGridTable aria-label='Novels' table={table} />
    </DataGridScrollArea>
  </DataGridContainer>
  <DataGridPagination table={table} />
</DataGrid>`
      }
    }
  },
  name: 'Dense layout',
  render: () => {
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: 'Title',
          cell: ({ row }) => <AvatarLinkCell row={row.original} />,
          size: 200,
          enableSorting: true,
          enableHiding: false
        },
        {
          accessorKey: 'author',
          header: 'Author',
          cell: (info) => (
            <a href={`mailto:${String(info.getValue())}`} {...stylex.props(s.link)}>
              {String(info.getValue())}
            </a>
          ),
          size: 175
        },
        {
          accessorKey: 'country',
          header: 'Country',
          size: 150
        },
        {
          accessorKey: 'price',
          header: 'Price ($)',
          cell: balanceCell,
          size: 100
        }
      ],
      []
    )
    const table = useDemoTable(columns)

    return (
      <DataGrid table={table} recordCount={demoData?.length || 0} tableLayout={{ dense: true }}>
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

/** Without table borders. */
export const WithoutTableBorders: Story = {
  name: 'Without table borders',
  render: () => {
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: 'Title',
          cell: ({ row }) => <AvatarCell row={row.original} />,
          size: 225,
          enableSorting: true,
          enableHiding: false
        },
        {
          accessorKey: 'country',
          header: 'Country',
          size: 175
        },
        {
          accessorKey: 'role',
          header: 'Genre',
          size: 150
        },
        {
          accessorKey: 'price',
          header: 'Price ($)',
          cell: balanceCell,
          size: 100
        }
      ],
      []
    )
    const table = useDemoTable(columns)

    return (
      <DataGrid
        table={table}
        recordCount={demoData?.length || 0}
        tableStyles={{ edgeCell: s.edgeCell }}
        tableLayout={{
          headerBackground: false,
          rowBorder: false
        }}
      >
        <div {...stylex.props(s.stack)}>
          <Card style={s.cardFlush}>
            <DataGridContainer>
              <DataGridScrollArea table={table}>
                <DataGridTable aria-label='Novels' table={table} />
              </DataGridScrollArea>
            </DataGridContainer>
          </Card>
          <DataGridPagination table={table} />
        </div>
      </DataGrid>
    )
  }
}

/** Striped rows. */
export const StripedRows: Story = {
  name: 'Striped rows',
  render: () => {
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: 'Title',
          cell: ({ row }) => <AvatarLinkCell row={row.original} />,
          size: 175,
          enableSorting: true,
          enableHiding: false
        },
        {
          accessorKey: 'author',
          header: 'Author',
          cell: (info) => (
            <a href={`mailto:${String(info.getValue())}`} {...stylex.props(s.link)}>
              {String(info.getValue())}
            </a>
          ),
          size: 180
        },
        {
          accessorKey: 'country',
          header: 'Country',
          size: 160
        },
        {
          accessorKey: 'price',
          header: 'Price ($)',
          cell: balanceCell,
          size: 100
        }
      ],
      []
    )
    const table = useDemoTable(columns)

    return (
      <DataGrid table={table} recordCount={demoData?.length || 0} tableLayout={{ stripped: true }}>
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

/** Auto width table layout. */
export const AutoWidthTableLayout: Story = {
  name: 'Auto width table layout',
  render: () => {
    const columns = useMemo<ColumnDef<DataGridFeatures, IBook>[]>(
      () => [
        {
          accessorKey: 'title',
          id: 'title',
          header: 'Title',
          cell: ({ row }) => <AvatarLinkCell row={row.original} />,
          size: 225,
          enableSorting: true,
          enableHiding: false
        },
        {
          accessorKey: 'author',
          header: 'Author',
          cell: (info) => (
            <a href={`mailto:${String(info.getValue())}`} {...stylex.props(s.link)}>
              {String(info.getValue())}
            </a>
          ),
          size: 200
        },
        {
          accessorKey: 'published',
          header: 'Published',
          size: 120
        },
        {
          accessorKey: 'price',
          header: 'Price ($)',
          cell: balanceCell,
          size: 120
        }
      ],
      []
    )
    const table = useDemoTable(columns)

    return (
      <DataGrid table={table} recordCount={demoData?.length || 0} tableLayout={{ width: 'auto' }}>
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

const plainColumns: ColumnDef<DataGridFeatures, IBook>[] = [
  { accessorKey: 'title', header: 'Title', size: 220 },
  { accessorKey: 'author', header: 'Author', size: 180 }
]

/** `border` on the container draws an edge around the grid; the default has none. */
export const ContainerBorder: Story = {
  name: 'Container border',
  render: () => {
    const table = useDemoTable(plainColumns)
    return (
      <DataGrid table={table} recordCount={demoData?.length || 0}>
        <div {...stylex.props(s.stack)}>
          {[false, true].map((border) => (
            <div key={String(border)} data-border={String(border)}>
              <DataGridContainer border={border}>
                <DataGridScrollArea table={table}>
                  <DataGridTable aria-label='Novels' table={table} />
                </DataGridScrollArea>
              </DataGridContainer>
            </div>
          ))}
        </div>
      </DataGrid>
    )
  },
  play: async ({ canvasElement }) => {
    const container = (border: string) => {
      const el = canvasElement.querySelector(`[data-border="${border}"] [data-slot="data-grid"]`)
      if (!el) throw new Error(`No container for border ${border}`)
      return getComputedStyle(el)
    }
    await expect(container('false').borderTopWidth).toBe('0px')
    await expect(container('true').borderTopWidth).toBe('1px')
    await expect(container('true').borderTopLeftRadius).toBe('10px')
  }
}

/** Each header row carries the id of its header group as `data-header-row-id`, so a test or a script can find it. */
export const HeaderRowId: Story = {
  name: 'Header row id',
  render: () => {
    const table = useDemoTable(plainColumns)
    return (
      <DataGrid table={table} recordCount={demoData?.length || 0}>
        <DataGridContainer>
          <DataGridScrollArea table={table}>
            <DataGridTable aria-label='Novels' table={table} />
          </DataGridScrollArea>
        </DataGridContainer>
      </DataGrid>
    )
  },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('thead tr[data-header-row-id]')
    // The grid merges the pinned sections of one header row into a single id.
    await expect(row?.getAttribute('data-header-row-id')).toBe('start_0:center_0:end_0')
    // The data rows keep their own attribute: the header row must not match their selector.
    await expect(canvasElement.querySelector('thead tr[data-row-id]')).toBeNull()
    await expect(canvasElement.querySelector('tbody tr[data-row-id]')).not.toBeNull()
  }
}
