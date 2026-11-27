import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  assignRef,
  getDataGridTableMergedHeaderGroups,
  getDataGridTableResolvedRows,
  getDataGridTreeIndent,
  getPinningStyles,
  hasDataGridTableRightPinnedColumns,
  nextColumnSize
} from './data-grid-table-utils'
import { mountTestTable } from './test-table'
import type { TestTableOptions } from './test-table'

interface Book {
  title: string
}

// Every table here is a real TanStack table (`test-table.ts`); each test mounts its own and the
// hook below unmounts them.
const unmounts: Array<() => void> = []
function mount<TData extends object>(options: TestTableOptions<TData>) {
  const grid = mountTestTable(options)
  unmounts.push(grid.unmount)
  return grid
}
afterEach(() => {
  for (const unmount of unmounts.splice(0)) unmount()
})

const titles = ['langdon', 'neveu', 'teabing', 'vetra', 'solomon']
const rowsOf = (pin: { top?: string[]; bottom?: string[] }, ids = titles) =>
  mount<Book>({
    data: ids.map((title) => ({ title })),
    columns: [{ id: 'title', accessorKey: 'title' }],
    getRowId: (book) => book.title,
    initialState: { rowPinning: { top: [], bottom: [], ...pin } }
  }).table()
const resolve = (table: ReturnType<typeof rowsOf>, pinnable?: boolean) =>
  getDataGridTableResolvedRows(table, pinnable).map((entry) => [entry.row.id, entry.pinnedBoundary])

// Sizes are asymmetric so a swapped offset shows: `a` is 120 wide before `b` at the start, and
// `d` is 48 wide after `c` at the end.
const pinStyles = (columnId: string) => {
  const table = mount<Book>({
    data: [],
    columns: [
      { id: 'a', accessorKey: 'title', size: 120 },
      { id: 'b', accessorKey: 'title', size: 150 },
      { id: 'free', accessorKey: 'title', size: 90 },
      { id: 'c', accessorKey: 'title', size: 150 },
      { id: 'd', accessorKey: 'title', size: 48 }
    ],
    initialState: { columnPinning: { start: ['a', 'b'], end: ['c', 'd'] } }
  }).table()
  return getPinningStyles(table.getColumn(columnId)!)
}

const nested = [
  { title: 'Origin', children: [{ title: 'Inferno', children: [{ title: 'Angels' }] }] }
]
interface Nested {
  title: string
  children?: Nested[]
}
const depthOf = (indent?: number) => {
  const table = mount<Nested>({
    data: nested,
    columns: [{ id: 'title', accessorKey: 'title' }],
    getRowId: (book) => book.title,
    getSubRows: (book) => book.children,
    initialState: { expanded: true }
  }).table()
  return table.getRowModel().rows.map((row) => getDataGridTreeIndent(row, indent))
}

describe('getDataGridTableResolvedRows', () => {
  it('keeps the row model order and marks no boundary when rows are not pinnable', () => {
    expect(resolve(rowsOf({ top: ['langdon', 'neveu'], bottom: ['vetra', 'solomon'] }))).toEqual([
      ['langdon', undefined],
      ['neveu', undefined],
      ['teabing', undefined],
      ['vetra', undefined],
      ['solomon', undefined]
    ])
  })

  it('lists top, center, then bottom rows and marks the last top and the first bottom row', () => {
    const table = rowsOf({ top: ['langdon', 'neveu'], bottom: ['vetra', 'solomon'] })
    expect(resolve(table, true)).toEqual([
      ['langdon', undefined],
      ['neveu', 'top'],
      ['teabing', undefined],
      ['vetra', 'bottom'],
      ['solomon', undefined]
    ])
  })

  it('follows the pin order and not the data order inside a pinned section', () => {
    const table = rowsOf({ top: ['solomon', 'langdon'] })
    expect(resolve(table, true).map(([id]) => id)).toEqual([
      'solomon',
      'langdon',
      'neveu',
      'teabing',
      'vetra'
    ])
  })

  it('marks both boundaries when only top and bottom rows exist', () => {
    expect(
      resolve(rowsOf({ top: ['a'], bottom: ['vetra', 'solomon'] }, ['a', 'vetra', 'solomon']), true)
    ).toEqual([
      ['a', 'top'],
      ['vetra', 'bottom'],
      ['solomon', undefined]
    ])
  })

  it('marks no boundary on pinned rows with nothing else to separate from', () => {
    expect(resolve(rowsOf({ top: ['langdon', 'neveu'] }, ['langdon', 'neveu']), true)).toEqual([
      ['langdon', undefined],
      ['neveu', undefined]
    ])
    expect(resolve(rowsOf({ bottom: ['vetra', 'solomon'] }, ['vetra', 'solomon']), true)).toEqual([
      ['vetra', undefined],
      ['solomon', undefined]
    ])
  })
})

describe('getDataGridTableMergedHeaderGroups', () => {
  interface Wide {
    a: string
    b: string
    c: string
    d: string
  }
  const wide = (columnPinning: { start?: string[]; end?: string[] }) =>
    mount<Wide>({
      data: [],
      columns: [
        {
          id: 'g',
          header: 'Group',
          columns: [
            { id: 'a', accessorKey: 'a' },
            { id: 'b', accessorKey: 'b' }
          ]
        },
        { id: 'c', accessorKey: 'c' },
        { id: 'd', accessorKey: 'd' }
      ],
      initialState: { columnPinning: { start: [], end: [], ...columnPinning } }
    }).table()
  const headerIds = (table: ReturnType<typeof wide>) =>
    getDataGridTableMergedHeaderGroups(table).map((level) => level.headers.map((h) => h.id))

  it('merges the start, center, and end group of each level and joins their ids', () => {
    const merged = getDataGridTableMergedHeaderGroups(wide({ start: ['a'], end: ['d'] }))
    expect(merged.map((level) => level.id)).toEqual([
      'start_0:center_0:end_0',
      'start_1:center_1:end_1'
    ])
    // The leaf level is a, b, c, d in display order; the parent level holds one header per
    // pinned section, the group `g` split in two and the placeholders of c and d.
    expect(merged[1]!.headers.map((header) => header.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(merged[0]!.headers).toHaveLength(4)
  })

  it('puts the pinned sections around the center in the display order', () => {
    expect(headerIds(wide({ start: ['c'], end: ['a'] }))[1]).toEqual(['c', 'b', 'd', 'a'])
  })

  it('keeps the declaration order when nothing is pinned', () => {
    expect(headerIds(wide({}))[1]).toEqual(['a', 'b', 'c', 'd'])
  })

  it('has no headers for a table with no columns', () => {
    const merged = getDataGridTableMergedHeaderGroups(
      mount<Wide>({ data: [], columns: [] }).table()
    )
    expect(merged.flatMap((level) => level.headers)).toEqual([])
  })
})

describe('getPinningStyles', () => {
  it('sticks a start-pinned column after the start columns before it, in the pinned layer', () => {
    const styles = pinStyles('b')
    expect(styles.insetInlineStart).toBe('120px')
    expect(styles.insetInlineEnd).toBeNull()
    expect(styles.position).toBe('sticky')
    expect(styles.zIndex).toBe(30)
    expect(styles.width).toBe(150)
    expect(pinStyles('a').insetInlineStart).toBe('0px')
  })

  it('sticks an end-pinned column before the end columns after it', () => {
    const styles = pinStyles('c')
    expect(styles.insetInlineEnd).toBe('48px')
    expect(styles.insetInlineStart).toBeNull()
    expect(styles.position).toBe('sticky')
    expect(styles.width).toBe(150)
    expect(pinStyles('d').insetInlineEnd).toBe('0px')
  })

  it('leaves an unpinned column in the flow with only its width', () => {
    const styles = pinStyles('free')
    expect(styles.position).toBeNull()
    expect(styles.insetInlineStart).toBeNull()
    expect(styles.insetInlineEnd).toBeNull()
    expect(styles.zIndex).toBeNull()
    expect(styles.width).toBe(90)
  })
})

const pinned = (columnPinning: { start?: string[]; end?: string[] }) =>
  mount<{ price: string }>({
    data: [],
    columns: [{ id: 'price', accessorKey: 'price' }],
    initialState: { columnPinning: { start: [], end: [], ...columnPinning } }
  }).table()

describe('hasDataGridTableRightPinnedColumns', () => {
  it('is true only when at least one column is end-pinned', () => {
    expect(hasDataGridTableRightPinnedColumns(pinned({ end: ['price'] }))).toBe(true)
    expect(hasDataGridTableRightPinnedColumns(pinned({ end: [] }))).toBe(false)
    expect(hasDataGridTableRightPinnedColumns(pinned({ start: ['price'] }))).toBe(false)
    expect(hasDataGridTableRightPinnedColumns(pinned({}))).toBe(false)
  })
})

describe('getDataGridTreeIndent', () => {
  it('indents by depth times the step, 20 px by default', () => {
    expect(depthOf()).toEqual([0, 20, 40])
    expect(depthOf(16)[2]).toBe(32)
  })
})

describe('assignRef', () => {
  it('calls a callback ref with the node, and with null on unmount', () => {
    const ref = vi.fn()
    const node = document.createElement('tr')
    assignRef(ref, node)
    assignRef(ref, null)
    expect(ref.mock.calls).toEqual([[node], [null]])
  })

  it('writes an object ref and ignores a missing ref', () => {
    const ref = { current: null as HTMLElement | null }
    const node = document.createElement('tr')
    assignRef(ref, node)
    expect(ref.current).toBe(node)
    assignRef(ref, null)
    expect(ref.current).toBeNull()
    expect(() => assignRef(undefined, node)).not.toThrow()
  })
})

describe('nextColumnSize', () => {
  // A column of 100 px that may be 50 to 300 px wide.
  const base = { shiftKey: false, mirrored: false, size: 100, min: 50, max: 300 }
  const next = (over: Partial<Parameters<typeof nextColumnSize>[0]> & { key: string }) =>
    nextColumnSize({ ...base, ...over })

  it('moves the edge 10 px with an arrow and 50 px with Shift', () => {
    expect(next({ key: 'ArrowRight' })).toBe(110)
    expect(next({ key: 'ArrowLeft' })).toBe(90)
    expect(next({ key: 'ArrowRight', shiftKey: true })).toBe(150)
    expect(next({ key: 'ArrowLeft', shiftKey: true })).toBe(50)
  })

  it('stops at the minimum and the maximum, never past them', () => {
    expect(next({ key: 'ArrowLeft', size: 55 })).toBe(50)
    expect(next({ key: 'ArrowLeft', size: 50 })).toBe(50)
    expect(next({ key: 'ArrowRight', size: 295 })).toBe(300)
    expect(next({ key: 'ArrowRight', size: 280, shiftKey: true })).toBe(300)
  })

  it('jumps to the minimum with Home and the maximum with End, with or without Shift', () => {
    expect(next({ key: 'Home' })).toBe(50)
    expect(next({ key: 'End' })).toBe(300)
    expect(next({ key: 'Home', shiftKey: true })).toBe(50)
    expect(next({ key: 'End', shiftKey: true })).toBe(300)
  })

  it('swaps the arrows for a mirrored column (right to left, or pinned to the end)', () => {
    expect(next({ key: 'ArrowLeft', mirrored: true })).toBe(110)
    expect(next({ key: 'ArrowRight', mirrored: true })).toBe(90)
    expect(next({ key: 'ArrowLeft', mirrored: true, shiftKey: true })).toBe(150)
    // Home and End are not directions.
    expect(next({ key: 'Home', mirrored: true })).toBe(50)
    expect(next({ key: 'End', mirrored: true })).toBe(300)
  })

  it('has no End target when the column has no maximum, and still widens by arrow', () => {
    expect(next({ key: 'End', max: Infinity })).toBeNull()
    expect(next({ key: 'ArrowRight', max: Infinity })).toBe(110)
    expect(next({ key: 'ArrowRight', max: Infinity, size: 1000, shiftKey: true })).toBe(1050)
  })

  it('leaves every other key alone', () => {
    for (const key of ['Enter', 'ArrowUp', 'ArrowDown', 'a', ' ', 'Tab', 'PageUp']) {
      expect(next({ key })).toBeNull()
    }
  })
})
