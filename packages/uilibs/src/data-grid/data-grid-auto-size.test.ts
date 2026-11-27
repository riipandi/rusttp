import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDataGridAutoSizeController } from './data-grid'
import type { DataGridFeatures } from './data-grid'
import { mountTestTable, students } from './test-table'
import type { Student, TestTable } from './test-table'

// `house` is the autoSize column that absorbs free space: 200 px wide, never below 150.
// `year` is a second candidate (120 px, no minimum) that takes over when `house` is hidden.
const columns: ColumnDef<DataGridFeatures, Student>[] = [
  { id: 'name', accessorKey: 'name', size: 100 },
  { id: 'house', accessorKey: 'house', size: 200, minSize: 150, meta: { autoSize: true } },
  { id: 'year', accessorKey: 'year', size: 120, meta: { autoSize: true } }
]
const SETTLE_MS = 150

let grid: TestTable<Student>
const mount = (cols = columns) => {
  grid = mountTestTable<Student>({ data: students, columns: cols, getRowId: (s) => s.id })
  return createDataGridAutoSizeController(grid.table)
}
// The live sizing, as the controller reads it: the render snapshot lags until React commits.
const sizing = () => grid.table().atoms.columnSizing.get()
// A burst is measured per frame; moving past the window makes the next measurement a leading one.
const settle = () => vi.advanceTimersByTime(SETTLE_MS + 1)

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  grid.unmount()
  vi.useRealTimers()
})

describe('createDataGridAutoSizeController, first absorb', () => {
  it('writes the free space into the column width and reports it', () => {
    const controller = mount()
    expect(controller.apply(80)).toBe(true)
    expect(sizing()).toEqual({ house: 280 })
  })

  it('does nothing while the table overflows or fits exactly', () => {
    const controller = mount()
    expect(controller.apply(0)).toBe(false)
    expect(controller.apply(-30)).toBe(false)
    expect(sizing()).toEqual({})
  })

  it('does nothing when no visible column opts in', () => {
    const controller = mount([{ id: 'name', accessorKey: 'name', size: 100 }])
    expect(controller.apply(80)).toBe(false)
    expect(sizing()).toEqual({})
  })

  it('leaves a width the user already dragged alone', () => {
    const controller = mount()
    grid.act((table) => table.setColumnSizing({ house: 220 }))
    expect(controller.apply(80)).toBe(false)
    expect(sizing()).toEqual({ house: 220 })
  })
})

describe('createDataGridAutoSizeController, reflow', () => {
  it('adds the free space measured with the growth in place, and hands space back', () => {
    const controller = mount()
    controller.apply(80)
    settle()
    // 50 px wider window: the column was 280, now 330.
    expect(controller.apply(50)).toBe(true)
    expect(sizing()).toEqual({ house: 330 })
    settle()
    // The window narrows so the table overflows by 100: 330 - 100.
    expect(controller.apply(-100)).toBe(true)
    expect(sizing()).toEqual({ house: 230 })
  })

  it('stops at an explicit minSize', () => {
    const controller = mount()
    controller.apply(80)
    settle()
    expect(controller.apply(-400)).toBe(true)
    expect(sizing()).toEqual({ house: 150 })
  })

  // Known defect (found by this test): the controller documents a floor at the starting width
  // for a column with no minSize, but TanStack resolves `columnDef.minSize` to 20 for every
  // column, so the `?? base` fallback never runs and the column can shrink to 20 px. Flip this
  // to `it` when the floor is fixed.
  it.fails('stops at the starting width when the column has no minSize', () => {
    const controller = mount([
      { id: 'year', accessorKey: 'year', size: 120, meta: { autoSize: true } }
    ])
    controller.apply(80)
    settle()
    expect(controller.apply(-400)).toBe(true)
    expect(sizing()).toEqual({ year: 120 })
  })

  it('drops a change under one pixel and keeps one of a whole pixel', () => {
    const controller = mount()
    controller.apply(80)
    settle()
    expect(controller.apply(0.9)).toBe(false)
    expect(sizing()).toEqual({ house: 280 })
    settle()
    expect(controller.apply(1)).toBe(true)
    expect(sizing()).toEqual({ house: 281 })
  })

  it('commits once leading and once trailing for a burst of measurements', () => {
    const controller = mount()
    controller.apply(80)
    const writes: unknown[] = []
    grid.table().atoms.columnSizing.subscribe((value) => writes.push(value))

    expect(controller.apply(50)).toBe(true)
    expect(writes).toHaveLength(1)
    vi.advanceTimersByTime(40)
    expect(controller.apply(70)).toBe(false)
    vi.advanceTimersByTime(40)
    expect(controller.apply(90)).toBe(false)
    // Each parked measurement restarts the settle timer, so 149 ms after the last one is early.
    vi.advanceTimersByTime(SETTLE_MS - 1)
    expect(sizing()).toEqual({ house: 330 })
    expect(writes).toHaveLength(1)
    vi.advanceTimersByTime(1)
    // The trailing commit uses the newest measurement only: 330 + 90.
    expect(sizing()).toEqual({ house: 420 })
    expect(writes).toHaveLength(2)
  })
})

describe('createDataGridAutoSizeController, whose width it is', () => {
  it('stands down after the user drags the column', () => {
    const controller = mount()
    controller.apply(80)
    settle()
    grid.act((table) => table.setColumnSizing({ house: 250 }))
    expect(controller.apply(60)).toBe(false)
    expect(sizing()).toEqual({ house: 250 })
    settle()
    expect(controller.apply(-60)).toBe(false)
    expect(sizing()).toEqual({ house: 250 })
  })

  it('fills again after the sizing is reset', () => {
    const controller = mount()
    controller.apply(80)
    settle()
    grid.act((table) => table.resetColumnSizing())
    expect(sizing()).toEqual({})
    // Back at the 200 px column width, not the 280 it had grown to.
    expect(controller.apply(60)).toBe(true)
    expect(sizing()).toEqual({ house: 260 })
  })

  it('reads the sizing it wrote before React renders it', () => {
    const controller = mount()
    controller.apply(80)
    // No flush: the table the controller gets still holds the pre-commit render snapshot.
    expect(grid.table().state.columnSizing).toEqual({})
    settle()
    expect(controller.apply(10)).toBe(true)
    expect(sizing()).toEqual({ house: 290 })
  })

  it('does not take its own newest width for a drag when the render is one commit behind', () => {
    const controller = mount()
    controller.apply(80)
    // React renders 280 ...
    grid.act(() => {})
    expect(grid.table().state.columnSizing).toEqual({ house: 280 })
    settle()
    // ... then the controller writes 330 and a measurement lands before the next render.
    controller.apply(50)
    expect(grid.table().state.columnSizing).toEqual({ house: 280 })
    settle()
    expect(controller.apply(10)).toBe(true)
    expect(sizing()).toEqual({ house: 340 })
  })

  it('shares one record between two controllers of the same table', () => {
    const first = mount()
    const second = createDataGridAutoSizeController(grid.table)
    first.apply(80)
    settle()
    // The second controller (a StrictMode double mount) must see 280 as the grown width, not as
    // a user drag, and so keep reflowing it.
    expect(second.apply(50)).toBe(true)
    expect(sizing()).toEqual({ house: 330 })
  })

  it('moves the growth to the next candidate when the grown column is hidden', () => {
    const controller = mount()
    controller.apply(80)
    settle()
    grid.act((table) => table.setColumnVisibility({ house: false }))
    expect(controller.apply(50)).toBe(true)
    // house goes back to its 200 px start, year takes the space from its 120 px start.
    expect(sizing()).toEqual({ house: 200, year: 170 })
  })

  it('keeps the width the user gave the old column when the candidate switches', () => {
    const controller = mount()
    controller.apply(80)
    settle()
    grid.act((table) => table.setColumnSizing({ house: 300 }))
    grid.act((table) => table.setColumnVisibility({ house: false }))
    expect(controller.apply(50)).toBe(true)
    expect(sizing()).toEqual({ house: 300, year: 170 })
  })
})
