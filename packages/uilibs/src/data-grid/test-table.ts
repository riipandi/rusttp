import { useTable } from '@tanstack/react-table'
import type { ColumnDef, TableState } from '@tanstack/react-table'
import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { dataGridFeatures } from './data-grid'
import type { DataGridFeatures, DataGridTableInstance } from './data-grid'

/**
 * A real TanStack v9 table with the data grid's own feature bundle, for unit tests of the
 * grid's table helpers.
 *
 * It renders `useTable` into a detached root rather than calling `constructTable`: a table
 * needs a reactivity binding, and the bindings that ship with TanStack live in packages
 * (`@tanstack/react-store`, `@tanstack/table-core`) that `uilibs` does not depend on. The
 * hook is the binding the grid itself runs on, and its return value is already the
 * `DataGridTableInstance` type, so the fixture needs no assertion.
 */

export interface Student {
  id: string
  name: string
  house: string
  year: number
}

export const students: Student[] = [
  { id: 'harry', name: 'Harry Potter', house: 'Gryffindor', year: 5 },
  { id: 'hermione', name: 'Hermione Granger', house: 'Gryffindor', year: 5 },
  { id: 'draco', name: 'Draco Malfoy', house: 'Slytherin', year: 5 },
  { id: 'luna', name: 'Luna Lovegood', house: 'Ravenclaw', year: 4 },
  { id: 'cedric', name: 'Cedric Diggory', house: 'Hufflepuff', year: 6 }
]

export interface TestTableOptions<TData extends object> {
  data: TData[]
  columns: ColumnDef<DataGridFeatures, TData>[]
  getRowId?: (row: TData) => string
  getSubRows?: (row: TData) => TData[] | undefined
  initialState?: Partial<TableState<DataGridFeatures>>
  keepPinnedRows?: boolean
}

type CellAddress = [rowId: string, columnId: string]

export interface TestTable<TData extends object> {
  /** The newest table: v9 hands back a new wrapper after every state change. */
  table: () => DataGridTableInstance<TData>
  /** Runs a state change and flushes the render it causes, so `table()` is current after it. */
  act: (change: (table: DataGridTableInstance<TData>) => void) => void
  /** Selects one range, replacing any other; the anchor becomes the focused cell. */
  select: (anchor: CellAddress, focus: CellAddress) => void
  unmount: () => void
}

export function mountTestTable<TData extends object>(
  options: TestTableOptions<TData>
): TestTable<TData> {
  let latest: DataGridTableInstance<TData> | null = null
  const Harness = () => {
    latest = useTable({ features: dataGridFeatures, ...options })
    return null
  }
  const root = createRoot(document.createElement('div'))
  flushSync(() => root.render(createElement(Harness)))

  const table = () => {
    if (!latest) throw new Error('the test table has not rendered')
    return latest
  }
  const act: TestTable<TData>['act'] = (change) => {
    flushSync(() => change(table()))
  }
  return {
    table,
    act,
    select: ([anchorRowId, anchorColumnId], [focusRowId, focusColumnId]) =>
      act((t) =>
        t.selectCellRange(
          { anchorRowId, anchorColumnId, focusRowId, focusColumnId },
          { mode: 'replace' }
        )
      ),
    unmount: () => root.unmount()
  }
}
