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

export interface DataGridLabels {
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
  pinRow: string
  unpinRow: string
  selectRow: string
  selectAll: string
  expandRow: string
  collapseRow: string
  dragToReorder: string
  dragToReorderRow: string
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
  pinRow: 'Pin row',
  unpinRow: 'Unpin row',
  selectRow: 'Select row',
  selectAll: 'Select all',
  expandRow: 'Expand row',
  collapseRow: 'Collapse row',
  dragToReorder: 'Drag to reorder',
  dragToReorderRow: 'Drag to reorder row',
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
