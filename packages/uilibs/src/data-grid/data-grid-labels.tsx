/**
 * Every built-in user-facing string in the data grid, overridable in one
 * place: `<DataGrid labels={{ ... }} />`. Functions stand in for anything
 * interpolated so pluralization and word order live in the label, never in
 * string concatenation at a call site.
 *
 * Precedence, most specific wins: a component-level prop (`rowCreateLabel`,
 * `loadingMessage`, the pagination label props) beats the matching entry of
 * `labels`, which beats the built-in default.
 */

import { defaultDragLabels } from '../extra/sortable/drag-announcements'
import type { DragLabels } from '../extra/sortable/drag-announcements'

/** `DragLabels` (`instructions`, `pickedUp`, `movedOver`, `dropped`, `cancelled`) is what a screen reader hears while a row or column is dragged with the keyboard; it names the row or column, as Kanban does. */
export interface DataGridLabels extends DragLabels {
  /* The column header menu. */
  sortAscending: string
  sortDescending: string
  pinColumnStart: string
  pinColumnEnd: string
  moveColumnStart: string
  moveColumnEnd: string
  columnsMenu: string
  unpinColumn: (title: string) => string
  toggleColumns: string
  /* Row and cell affordances. */
  rowCreate: string
  /* A row control names its row, so ten rows give ten different names. */
  pinRow: (name: string) => string
  unpinRow: (name: string) => string
  selectRow: (name: string) => string
  selectAll: string
  expandRow: (name: string) => string
  collapseRow: (name: string) => string
  dragToReorderRow: (name: string) => string
  dragToReorderColumn: (title: string) => string
  /** A row's name when `getRowLabel` is absent; `position` is 1-based in the data. */
  rowNumber: (position: number) => string
  reorderingUnavailable: string
  /* Grid states. */
  loading: string
  empty: string
  allRowsLoaded: string
  /* Pagination. */
  rowsPerPage: string
  paginationInfo: (info: { from: number; to: number; count: number }) => string
  previousPage: string
  nextPage: string
  goToPage: (page: number) => string
  paginationEllipsis: string
  /* The faceted column filter. */
  filterSelectedCount: (count: number) => string
  filterNoResults: string
  filterClear: string
}

const DEFAULT_DATA_GRID_LABELS: DataGridLabels = {
  ...defaultDragLabels,
  sortAscending: 'Asc',
  sortDescending: 'Desc',
  pinColumnStart: 'Pin to left',
  pinColumnEnd: 'Pin to right',
  moveColumnStart: 'Move to left',
  moveColumnEnd: 'Move to right',
  columnsMenu: 'Columns',
  unpinColumn: (title) => `Unpin ${title} column`,
  toggleColumns: 'Toggle Columns',
  rowCreate: 'Add row',
  pinRow: (name) => `Pin ${name}`,
  unpinRow: (name) => `Unpin ${name}`,
  selectRow: (name) => `Select ${name}`,
  selectAll: 'Select all',
  expandRow: (name) => `Expand ${name}`,
  collapseRow: (name) => `Collapse ${name}`,
  dragToReorderRow: (name) => `Drag to reorder ${name}`,
  dragToReorderColumn: (title) => `Drag to reorder ${title} column`,
  rowNumber: (position) => `Row ${position}`,
  reorderingUnavailable: 'Reordering unavailable',
  loading: 'Loading...',
  empty: 'No data available',
  allRowsLoaded: 'All records loaded',
  rowsPerPage: 'Rows per page',
  paginationInfo: ({ from, to, count }) => `${from} - ${to} of ${count}`,
  previousPage: 'Go to previous page',
  nextPage: 'Go to next page',
  goToPage: (page) => `Go to page ${page}`,
  paginationEllipsis: '...',
  filterSelectedCount: (count) => `${count} selected`,
  filterNoResults: 'No results found.',
  filterClear: 'Clear filters'
}
Object.freeze(DEFAULT_DATA_GRID_LABELS)

/**
 * A shallow merge, deliberately: a deep merge would leak a default back into a function-valued
 * label the consumer replaced. With no overrides the frozen default is returned as-is, so the
 * merge is free to run on every render without producing a new identity.
 */
export function mergeDataGridLabels(overrides?: Partial<DataGridLabels>): DataGridLabels {
  if (!overrides) return DEFAULT_DATA_GRID_LABELS
  return { ...DEFAULT_DATA_GRID_LABELS, ...overrides }
}
