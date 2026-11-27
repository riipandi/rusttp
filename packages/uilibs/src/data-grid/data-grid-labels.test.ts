import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultDragLabels } from '../extra/sortable/drag-announcements'
import { getColumnHeaderLabel } from './data-grid'
import type { DataGridFeatures } from './data-grid'
import { mergeDataGridLabels } from './data-grid-labels'
import { mountTestTable } from './test-table'
import type { Student, TestTable } from './test-table'

describe('mergeDataGridLabels', () => {
  it('returns the one frozen default, by identity, when nothing is overridden', () => {
    const labels = mergeDataGridLabels()
    expect(mergeDataGridLabels()).toBe(labels)
    expect(Object.isFrozen(labels)).toBe(true)
  })

  it('replaces a string label and keeps every other default', () => {
    const labels = mergeDataGridLabels({ empty: 'Nothing in the Restricted Section' })
    expect(labels.empty).toBe('Nothing in the Restricted Section')
    expect(labels.loading).toBe('Loading...')
    expect(labels.rowsPerPage).toBe('Rows per page')
  })

  it('does not write the override back into the default', () => {
    mergeDataGridLabels({ empty: 'Nothing in the Restricted Section' })
    expect(mergeDataGridLabels().empty).toBe('No data available')
    expect(mergeDataGridLabels({ loading: 'Accio' })).not.toBe(mergeDataGridLabels())
  })

  it('replaces a function label whole, and leaves the other function labels alone', () => {
    const labels = mergeDataGridLabels({ selectRow: (name) => `Choose ${name}` })
    expect(labels.selectRow('Hermione Granger')).toBe('Choose Hermione Granger')
    expect(labels.pinRow('Hermione Granger')).toBe('Pin Hermione Granger')
  })

  it('carries the drag announcements of the sortable defaults', () => {
    const labels = mergeDataGridLabels()
    expect(labels.instructions).toBe(defaultDragLabels.instructions)
    expect(labels.pickedUp).toBe(defaultDragLabels.pickedUp)
  })

  it.each([
    ['one row is singular', 1, '1 row loaded'],
    ['no rows is plural', 0, '0 rows loaded'],
    ['two rows is plural', 2, '2 rows loaded'],
    ['twelve rows is plural', 12, '12 rows loaded']
  ])('words the loaded announcement: %s', (_name, count, text) => {
    expect(mergeDataGridLabels().loaded(count)).toBe(text)
  })

  it('writes the built-in interpolated labels', () => {
    const labels = mergeDataGridLabels()
    expect(labels.paginationInfo({ from: 11, to: 20, count: 42 })).toBe('11 - 20 of 42')
    expect(labels.goToPage(3)).toBe('Go to page 3')
    expect(labels.rowNumber(5)).toBe('Row 5')
    expect(labels.columnWidth(160)).toBe('160 px')
    expect(labels.resizeColumn('House')).toBe('Resize House column')
    expect(labels.unpinColumn('House')).toBe('Unpin House column')
    expect(labels.dragToReorderColumn('House')).toBe('Drag to reorder House column')
    expect(labels.dragToReorderRow('Luna Lovegood')).toBe('Drag to reorder Luna Lovegood')
    expect(labels.filterSelectedCount(4)).toBe('4 selected')
  })
})

describe('getColumnHeaderLabel', () => {
  let grid: TestTable<Student>
  afterEach(() => grid.unmount())
  const labelOf = (column: ColumnDef<DataGridFeatures, Student>) => {
    grid = mountTestTable<Student>({ data: [], columns: [column] })
    const found = grid.table().getAllLeafColumns()[0]!
    return getColumnHeaderLabel(found)
  }

  it('prefers meta.headerTitle over a string header', () => {
    expect(
      labelOf({ id: 'name', accessorKey: 'name', header: 'Name', meta: { headerTitle: 'Student' } })
    ).toBe('Student')
  })

  it('uses meta.headerTitle when the header is a render function', () => {
    expect(
      labelOf({
        id: 'name',
        accessorKey: 'name',
        header: () => 'rendered',
        meta: { headerTitle: 'Student' }
      })
    ).toBe('Student')
  })

  it('uses a string header when there is no headerTitle', () => {
    expect(labelOf({ id: 'house', accessorKey: 'house', header: 'Hogwarts House' })).toBe(
      'Hogwarts House'
    )
  })

  it('falls back to the column id for a header that renders, and for none', () => {
    expect(labelOf({ id: 'house', accessorKey: 'house', header: () => 'rendered' })).toBe('house')
    expect(labelOf({ id: 'year', accessorKey: 'year' })).toBe('year')
  })
})
