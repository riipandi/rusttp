import * as stylex from '@stylexjs/stylex'
import type { Cell, Column, Header, Row } from '@tanstack/react-table'
import type { CSSProperties, Ref } from 'react'
import { getDataGridCellSelectionCellAttrs, useDataGrid } from './data-grid'
import type { DataGridFeatures, DataGridTableInstance } from './data-grid'
import { dataGridTableStyles as s } from './data-grid-table.stylex'
import type { DataGridPinningStyle } from './data-grid-table.stylex'
import { dataGridCellSelectionStyles, gridLayer } from './data-grid.stylex'

type DataGridCellSelectionAttrs = ReturnType<typeof getDataGridCellSelectionCellAttrs>

/**
 * StyleX counterpart of the source's `dataGridCellSelectionCellClasses` Tailwind
 * string: selection chrome for a body td, applied as conditional
 * stylex.props arguments. All inputs are React-known (the cell selection
 * attrs plus geometry flags), so no data-attribute selectors are needed
 * except the imperative fill/edit states, which live in globals.css.
 */
function cellSelectionChromeProps(
  selection: DataGridCellSelectionAttrs | null,
  geometry: {
    isFirstColumn: boolean
    isLastColumn: boolean
    isFirstRow: boolean
    isLastRow: boolean
    nextPinned: boolean
    prevPinned: boolean
    nextIsFillCell: boolean
  }
) {
  if (!selection) return []
  const chrome = dataGridCellSelectionStyles
  const selected = !!selection['data-cell-selected']
  const focused = !!selection['data-cell-focused']
  const pinned = 'data-pinned' in selection && !!selection['data-pinned']
  // Boundary clamps: first/last column, first/last row, and cells adjacent
  // to a pinned column or the resize filler strip (all React-known).
  const clampEnd = geometry.isLastColumn || geometry.nextPinned || geometry.nextIsFillCell
  const clampStart = geometry.isFirstColumn || geometry.prevPinned
  return [
    chrome.cell,
    chrome.beforeOverlay,
    selected && chrome.selected,
    selected && pinned && chrome.selectedPinned,
    focused && chrome.focused,
    focused && pinned && chrome.focusedPinned,
    // Interior dividers: end + bottom gridlines repaint gray unless the side
    // belongs to the range perimeter (the edge styles below win the merge).
    selected && chrome.dividerEnd,
    selected && chrome.dividerBottom,
    // The Sheets model: edge attributes draw the full primary box of a
    // single-cell range; focusedRing covers a focused cell with no selection.
    !!selection['data-cell-edge-top'] && chrome.edgeTop,
    !!selection['data-cell-edge-right'] && chrome.edgeEnd,
    !!selection['data-cell-edge-bottom'] && chrome.edgeBottom,
    !!selection['data-cell-edge-left'] && chrome.edgeStart,
    focused && !selected && chrome.focusedRing,
    geometry.isFirstRow && chrome.clampTop,
    geometry.isLastRow && chrome.clampBottom,
    clampStart && chrome.clampStart,
    clampEnd && chrome.clampEnd
  ]
}

/** The inline padding of a tree row's toggle in px: its depth times the step. */
function getDataGridTreeIndent<TData extends object>(
  row: Row<DataGridFeatures, TData>,
  indent: number = 20
): number {
  return row.depth * indent
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return

  if (typeof ref === 'function') {
    ref(value)
    return
  }

  ;(ref as { current: T | null }).current = value
}

/**
 * Nearest scroll-area viewport that belongs to THIS grid. A viewport outside
 * the grid's own container (e.g. a page-level ScrollArea) would make the
 * width measurement - and the virtualizer - bind the wrong box.
 */
function getDataGridScrollAreaViewport(node: HTMLElement): HTMLElement | null {
  const scrollViewport = node.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')

  if (!scrollViewport) return null

  const gridContainer = node.closest('[data-slot="data-grid"]')
  if (gridContainer && !gridContainer.contains(scrollViewport)) return null

  return scrollViewport
}

type DataGridTablePinnedBoundary = 'top' | 'bottom'

function getDataGridTableRowSections<TData extends object>(
  table: DataGridTableInstance<TData>,
  rowsPinnable?: boolean
) {
  if (!rowsPinnable) {
    return {
      topRows: [],
      centerRows: table.getRowModel().rows,
      bottomRows: []
    }
  }

  return {
    topRows: table.getTopRows(),
    centerRows: table.getCenterRows(),
    bottomRows: table.getBottomRows()
  }
}

function getDataGridTableResolvedRows<TData extends object>(
  table: DataGridTableInstance<TData>,
  rowsPinnable?: boolean
) {
  const { topRows, centerRows, bottomRows } = getDataGridTableRowSections(table, rowsPinnable)
  const resolvedRows: Array<{
    row: Row<DataGridFeatures, TData>
    pinnedBoundary?: DataGridTablePinnedBoundary
  }> = []

  topRows.forEach((row, index) => {
    resolvedRows.push({
      row,
      pinnedBoundary:
        index === topRows.length - 1 && (centerRows.length > 0 || bottomRows.length > 0)
          ? 'top'
          : undefined
    })
  })

  centerRows.forEach((row) => {
    resolvedRows.push({ row })
  })

  bottomRows.forEach((row, index) => {
    resolvedRows.push({
      row,
      pinnedBoundary:
        index === 0 && (centerRows.length > 0 || topRows.length > 0) ? 'bottom' : undefined
    })
  })

  return resolvedRows
}

function getDataGridTableOrderedVisibleColumns<TData extends object>(
  table: DataGridTableInstance<TData>
) {
  return [
    ...table.getStartVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
    ...table.getEndVisibleLeafColumns()
  ] as Column<DataGridFeatures, TData>[]
}

function getDataGridTableOrderedVisibleCells<TData extends object>(
  row: Row<DataGridFeatures, TData>
) {
  return [
    ...row.getStartVisibleCells(),
    ...row.getCenterVisibleCells(),
    ...row.getEndVisibleCells()
  ] as Cell<DataGridFeatures, TData>[]
}

function getDataGridTableMergedHeaderGroups<TData extends object>(
  table: DataGridTableInstance<TData>
) {
  const leftHeaderGroups = table.getStartHeaderGroups()
  const centerHeaderGroups = table.getCenterHeaderGroups()
  const rightHeaderGroups = table.getEndHeaderGroups()
  const headerGroupCount = Math.max(
    leftHeaderGroups.length,
    centerHeaderGroups.length,
    rightHeaderGroups.length
  )

  return Array.from({ length: headerGroupCount }, (_, index) => {
    const leftGroup = leftHeaderGroups[index]
    const centerGroup = centerHeaderGroups[index]
    const rightGroup = rightHeaderGroups[index]

    return {
      id:
        [leftGroup?.id, centerGroup?.id, rightGroup?.id].filter(Boolean).join(':') ||
        `header-group-${index}`,
      headers: [
        ...(leftGroup?.headers ?? []),
        ...(centerGroup?.headers ?? []),
        ...(rightGroup?.headers ?? [])
      ] as Header<DataGridFeatures, TData>[]
    }
  })
}

function hasDataGridTableRightPinnedColumns<TData extends object>(
  table: DataGridTableInstance<TData>
) {
  return (table.state.columnPinning.end?.length ?? 0) > 0
}

function getPinningStyles<TData extends object>(
  column: Column<DataGridFeatures, TData>
): DataGridPinningStyle {
  const isPinned = column.getIsPinned()

  return {
    // Logical offsets: TanStack's "left"/"right" buckets are start/end
    // semantics, so pinned columns stick to the correct edge in RTL too
    // (identical to left/right in LTR).
    insetInlineStart: isPinned === 'start' ? `${column.getStart('start')}px` : null,
    insetInlineEnd: isPinned === 'end' ? `${column.getAfter('end')}px` : null,
    position: isPinned ? 'sticky' : null,
    transform: isPinned ? 'translateZ(0)' : null,
    contain: isPinned ? 'paint' : null,
    width: column.getSize(),
    zIndex: isPinned ? gridLayer.pinned : null,
    backgroundClip: isPinned ? 'padding-box' : null
  }
}

/** `getPinningStyles` without paint containment, for cells that draw selection chrome outside their box. */
function getPinningStylesUncontained<TData extends object>(
  column: Column<DataGridFeatures, TData>
): DataGridPinningStyle {
  return { ...getPinningStyles(column), contain: null }
}

// A meta.fillWidth column absorbs the free space itself, so the fill cells
// must collapse or the strip would be counted twice.
/** The keys a column's resize separator answers with a new width (Enter, the reset, is the caller's). */
type DataGridResizeKey = 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'

const DATA_GRID_RESIZE_STEP = 10
const DATA_GRID_RESIZE_STEP_LARGE = 50

/**
 * Whether a column resizes mirrored: the grid is laid out right to left (the computed `direction`
 * of the element, so `dir` on any ancestor decides and no option has to agree with it), or the
 * column is pinned to the end, which is anchored at its end edge and grows from its start edge.
 * One rule for the pointer drag, its indicator line, and the keys.
 */
function isColumnResizeMirrored(element: Element, pinned: false | 'start' | 'end'): boolean {
  return (getComputedStyle(element).direction === 'rtl') !== (pinned === 'end')
}

/**
 * The width a column takes after a key on its resize separator: an arrow moves the edge 10 px (50
 * with Shift), Home and End jump to the minimum and the maximum, and the result stays inside both.
 * `mirrored` is `isColumnResizeMirrored`, the drag's own rule (right to left, or an end-pinned column
 * that grows from its start edge): the arrow that points away from the anchor widens. Returns null
 * for a key the separator does not answer, and for End when the column has no maximum.
 */
function nextColumnSize({
  key,
  shiftKey,
  mirrored,
  size,
  min,
  max
}: {
  key: string
  shiftKey: boolean
  mirrored: boolean
  size: number
  min: number
  max: number
}): number | null {
  const clamp = (value: number) => Math.min(Math.max(value, min), max)
  const step = shiftKey ? DATA_GRID_RESIZE_STEP_LARGE : DATA_GRID_RESIZE_STEP
  const widen = mirrored ? 'ArrowLeft' : 'ArrowRight'
  const narrow = mirrored ? 'ArrowRight' : 'ArrowLeft'
  if (key === widen) return clamp(size + step)
  if (key === narrow) return clamp(size - step)
  if (key === 'Home') return min
  if (key === 'End') return Number.isFinite(max) ? max : null
  return null
}

function hasDataGridFillColumn<TData extends object>(table: DataGridTableInstance<TData>) {
  return table.getVisibleLeafColumns().some((column) => column.columnDef.meta?.fillWidth)
}

function getFillCellWidth<TData extends object>(
  table: DataGridTableInstance<TData>
): CSSProperties {
  return {
    width: hasDataGridFillColumn(table) ? 0 : 'var(--data-grid-fill-size, 0px)'
  }
}

function DataGridTableFillCol<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()

  if (!props.tableLayout?.columnsResizable) return null

  return <col data-slot='data-grid-table-fill-col' style={getFillCellWidth(table)} />
}

function DataGridTableFillHeadCell<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()

  if (!props.tableLayout?.columnsResizable) return null

  return (
    <th
      aria-hidden='true'
      data-slot='data-grid-table-fill-head-cell'
      style={getFillCellWidth(table)}
      {...stylex.props(s.fillCell, props.tableLayout?.headerBackground && s.fillHeadCellBackground)}
    />
  )
}

function DataGridTableFillBodyCell<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()

  if (!props.tableLayout?.columnsResizable) return null

  return (
    <td
      aria-hidden='true'
      data-slot='data-grid-table-fill-body-cell'
      style={getFillCellWidth(table)}
      {...stylex.props(s.fillCell)}
    />
  )
}

function DataGridTableFillFootCell<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()

  if (!props.tableLayout?.columnsResizable) return null

  return (
    <td
      aria-hidden='true'
      data-slot='data-grid-table-fill-foot-cell'
      style={getFillCellWidth(table)}
      {...stylex.props(s.fillCell)}
    />
  )
}

/**
 * One viewport's worth of rows for PageUp and PageDown, measured from the live layout; 10 when
 * nothing is measurable (jsdom). Data rows only: the virtual table's spacer rows carry the whole
 * scroll offset as height and would collapse the page size to a single row.
 */
function getDataGridPageRowCount(viewport: HTMLElement): number {
  const row = viewport.querySelector('tbody tr[data-row-id]')
  // The nearest ancestor that actually scrolls; in the scroll-area layout the viewport's parent is
  // a full-height content wrapper whose clientHeight would make the page span the whole table.
  let scroller: HTMLElement | null = viewport
  while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
    scroller = scroller.parentElement
  }
  const rowHeight = row?.getBoundingClientRect().height || 0
  const viewHeight = scroller?.clientHeight || viewport.clientHeight
  if (!rowHeight || !viewHeight) return 10
  return Math.max(1, Math.floor(viewHeight / rowHeight) - 1)
}

export {
  cellSelectionChromeProps,
  getDataGridTreeIndent,
  assignRef,
  getDataGridScrollAreaViewport,
  getDataGridTableRowSections,
  getDataGridTableResolvedRows,
  getDataGridTableOrderedVisibleColumns,
  getDataGridTableOrderedVisibleCells,
  getDataGridTableMergedHeaderGroups,
  hasDataGridTableRightPinnedColumns,
  getPinningStyles,
  getPinningStylesUncontained,
  nextColumnSize,
  isColumnResizeMirrored,
  getDataGridPageRowCount,
  DataGridTableFillCol,
  DataGridTableFillHeadCell,
  DataGridTableFillBodyCell,
  DataGridTableFillFootCell
}
export type { DataGridCellSelectionAttrs, DataGridResizeKey, DataGridTablePinnedBoundary }
