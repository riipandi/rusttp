import { describe, expect, it, vi } from 'vitest'
import type { DataGridTableInstance } from './data-grid'
import {
  assignRef,
  getDataGridTableMergedHeaderGroups,
  getDataGridTableResolvedRows,
  getDataGridTreeIndentStyle,
  getPinningStyles,
  hasDataGridTableRightPinnedColumns,
  nextColumnSize
} from './data-grid-table-utils'

interface Book {
  title: string
}

// The functions read a handful of table getters; each test stubs exactly those.
/* oxlint-disable typescript/no-unsafe-type-assertion -- stubs of the getters a function reads */
const tableOf = (stub: object) => stub as unknown as DataGridTableInstance<Book>
const row = (id: string) => ({ id })
const resolve = (stub: object, pinnable?: boolean) =>
  getDataGridTableResolvedRows(tableOf(stub), pinnable).map((entry) => [
    (entry.row as unknown as { id: string }).id,
    entry.pinnedBoundary
  ])
const group = (id: string, headers: string[]) => ({ id, headers })
const column = (pinned: false | 'start' | 'end') => ({
  getIsPinned: () => pinned,
  getStart: (position: string) => (position === 'start' ? 120 : -1),
  getAfter: (position: string) => (position === 'end' ? 48 : -1),
  getSize: () => 150
})
const stylesOf = (pinned: false | 'start' | 'end') => getPinningStyles(column(pinned) as never)
const pinned = (end?: string[]) => tableOf({ state: { columnPinning: { end } } })
const at = (depth: number, indent?: number) =>
  getDataGridTreeIndentStyle({ depth } as never, indent)
/* oxlint-enable typescript/no-unsafe-type-assertion */

describe('getDataGridTableResolvedRows', () => {
  const sections = {
    getTopRows: () => [row('langdon'), row('neveu')],
    getCenterRows: () => [row('teabing')],
    getBottomRows: () => [row('vetra'), row('solomon')],
    getRowModel: () => ({ rows: [row('langdon'), row('neveu'), row('teabing')] })
  }
  it('keeps the row model order and marks no boundary when rows are not pinnable', () => {
    expect(resolve(sections)).toEqual([
      ['langdon', undefined],
      ['neveu', undefined],
      ['teabing', undefined]
    ])
  })

  it('lists top, center, then bottom rows and marks the last top and the first bottom row', () => {
    expect(resolve(sections, true)).toEqual([
      ['langdon', undefined],
      ['neveu', 'top'],
      ['teabing', undefined],
      ['vetra', 'bottom'],
      ['solomon', undefined]
    ])
  })

  it('marks both boundaries when only top and bottom rows exist', () => {
    expect(
      resolve({ ...sections, getCenterRows: () => [], getTopRows: () => [row('a')] }, true)
    ).toEqual([
      ['a', 'top'],
      ['vetra', 'bottom'],
      ['solomon', undefined]
    ])
  })

  it('marks no boundary on pinned rows with nothing else to separate from', () => {
    expect(
      resolve({ ...sections, getCenterRows: () => [], getBottomRows: () => [] }, true)
    ).toEqual([
      ['langdon', undefined],
      ['neveu', undefined]
    ])
    expect(resolve({ ...sections, getCenterRows: () => [], getTopRows: () => [] }, true)).toEqual([
      ['vetra', undefined],
      ['solomon', undefined]
    ])
  })
})

describe('getDataGridTableMergedHeaderGroups', () => {
  it('merges the start, center, and end group of each level and joins their ids', () => {
    const merged = getDataGridTableMergedHeaderGroups(
      tableOf({
        getStartHeaderGroups: () => [group('s0', ['a'])],
        getCenterHeaderGroups: () => [group('c0', ['b', 'c']), group('c1', ['d'])],
        getEndHeaderGroups: () => [group('e0', ['z'])]
      })
    )
    expect(merged).toEqual([
      { id: 's0:c0:e0', headers: ['a', 'b', 'c', 'z'] },
      { id: 'c1', headers: ['d'] }
    ])
  })

  it('falls back to an indexed id when a level has no id and returns nothing for no groups', () => {
    expect(
      getDataGridTableMergedHeaderGroups(
        tableOf({
          getStartHeaderGroups: () => [group('', ['a'])],
          getCenterHeaderGroups: () => [],
          getEndHeaderGroups: () => []
        })
      )
    ).toEqual([{ id: 'header-group-0', headers: ['a'] }])
    expect(
      getDataGridTableMergedHeaderGroups(
        tableOf({
          getStartHeaderGroups: () => [],
          getCenterHeaderGroups: () => [],
          getEndHeaderGroups: () => []
        })
      )
    ).toEqual([])
  })
})

describe('getPinningStyles', () => {
  it('sticks a start-pinned column at its start offset in the pinned layer', () => {
    const styles = stylesOf('start')
    expect(styles.insetInlineStart).toBe('120px')
    expect(styles.insetInlineEnd).toBeUndefined()
    expect(styles.position).toBe('sticky')
    expect(styles.zIndex).toBe(30)
    expect(styles.width).toBe(150)
  })

  it('sticks an end-pinned column at its end offset', () => {
    const styles = stylesOf('end')
    expect(styles.insetInlineEnd).toBe('48px')
    expect(styles.insetInlineStart).toBeUndefined()
    expect(styles.position).toBe('sticky')
  })

  it('leaves an unpinned column in the flow with only its width', () => {
    const styles = stylesOf(false)
    expect(styles.position).toBeUndefined()
    expect(styles.insetInlineStart).toBeUndefined()
    expect(styles.insetInlineEnd).toBeUndefined()
    expect(styles.zIndex).toBeUndefined()
    expect(styles.width).toBe(150)
  })
})

describe('hasDataGridTableRightPinnedColumns', () => {
  it('is true only when at least one column is end-pinned', () => {
    expect(hasDataGridTableRightPinnedColumns(pinned(['price']))).toBe(true)
    expect(hasDataGridTableRightPinnedColumns(pinned([]))).toBe(false)
    expect(hasDataGridTableRightPinnedColumns(pinned(undefined))).toBe(false)
  })
})

describe('getDataGridTreeIndentStyle', () => {
  it('indents by depth times the step, 20 px by default', () => {
    expect(at(0)).toEqual({ '--data-grid-tree-padding': '0px' })
    expect(at(2)).toEqual({ '--data-grid-tree-padding': '40px' })
    expect(at(3, 16)).toEqual({ '--data-grid-tree-padding': '48px' })
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
