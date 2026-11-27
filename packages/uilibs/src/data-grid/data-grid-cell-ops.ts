import type { CellSelectionBounds } from '@tanstack/react-table'
import type {
  DataGridCellChange,
  DataGridCellRejection,
  DataGridCellsChangeDetails,
  DataGridColumnCellEdit,
  DataGridTableInstance
} from './data-grid'
import {
  dataGridFillTargetClassName,
  dataGridFillTargetPinnedClassName,
  dataGridGestureOutlineClassName
} from './data-grid.stylex'

/** Fill-drag tint classes, toggled imperatively alongside the attribute. */
const dataGridFillTargetClassNames = {
  base: dataGridFillTargetClassName,
  pinned: dataGridFillTargetPinnedClassName
}

/** Where a finished edit sends the focused cell, or null to stay. */
type DataGridEditorAdvance = 'down' | 'up' | 'right' | 'left' | null

interface DataGridFocusCellOptions {
  /** Also open the cell's editor, the way Enter would. */
  edit?: boolean
}

/** Imperative surface of the cell-selection controller. */
interface DataGridCellSelectionApi {
  /**
   * Moves the grid's cell focus AND the document focus together, retrying
   * briefly while the row mounts, so a freshly created row is typeable
   * without an extra click. `edit: true` also opens the cell's editor the
   * way Enter would. Registered once the controller is wired; null while
   * cell selection is off.
   */
  focusCell: (rowId: string, columnId: string, options?: DataGridFocusCellOptions) => void
  /** Clears every range and the focused cell. */
  clearSelection: () => void
  /** Scrolls a rendered cell into view without moving focus. */
  scrollToCell: (rowId: string, columnId: string) => void
}

/** One open built-in editor: which cell, which control, and its text. */
interface DataGridEditorSession {
  rowId: string
  columnId: string
  control: 'text' | 'textarea'
  /** What the editor opens with: the typed seed or the formatted value. */
  initialValue: string
  /** The formatted current value; an unchanged commit dispatches nothing. */
  baseline: string
  /** Accessible name for the overlay control, from the column's header. */
  label: string
}

/* ------------------------------------------------------------------------- *
 * Clipboard text: pure, node-testable.
 * ------------------------------------------------------------------------- */

function serializeDataGridClipboardField(field: string): string {
  // Excel and Sheets quote a field containing a delimiter and double inner
  // quotes; everything else ships bare.
  return /[\t\n\r"]/.test(field) ? '"' + field.replaceAll('"', '""') + '"' : field
}

/** Row-major grid to TSV, CRLF rows, Excel-style quoting. */
function serializeDataGridClipboardText(grid: string[][]): string {
  return grid.map((line) => line.map(serializeDataGridClipboardField).join('\t')).join('\r\n')
}

/**
 * TSV to a row-major grid. A stateful scan, not a split: a quoted field may
 * contain tabs, quotes and both newline flavors, which is exactly what Excel
 * emits for a multi-line cell.
 */
function parseDataGridClipboardText(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]!
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        quoted = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }
    if (ch === '"' && field === '') {
      quoted = true
      i += 1
      continue
    }
    if (ch === '\t') {
      row.push(field)
      field = ''
      i += 1
      continue
    }
    if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }
    field += ch
    i += 1
  }
  row.push(field)
  rows.push(row)

  // Excel terminates the payload with one newline; that final empty line is
  // an artifact of the format, not a data row.
  const last = rows[rows.length - 1]
  if (rows.length > 1 && last?.length === 1 && last[0] === '') rows.pop()

  return rows
}

/** Repeats a block cyclically to fill rowCount x columnCount. */
function tileDataGridClipboardBlock(
  block: string[][],
  rowCount: number,
  columnCount: number
): string[][] {
  const tiled: string[][] = []
  for (let r = 0; r < rowCount; r++) {
    const source = block[r % block.length] ?? []
    const line: string[] = []
    for (let c = 0; c < columnCount; c++) {
      line.push(source[c % (source.length || 1)] ?? '')
    }
    tiled.push(line)
  }
  return tiled
}

function escapeDataGridClipboardHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

// A minimal text/html flavor alongside the TSV keeps type fidelity when the
// paste target is Excel or Sheets. Newlines inside a field become <br>, the
// HTML representation of a multi-line cell; raw newlines would collapse to
// spaces on paste.
function renderDataGridClipboardHtml(grid: string[][]): string {
  const body = grid
    .map(
      (line) =>
        '<tr>' +
        line
          .map(
            (field) =>
              '<td>' + escapeDataGridClipboardHtml(field).replace(/\r\n|\r|\n/g, '<br>') + '</td>'
          )
          .join('') +
        '</tr>'
    )
    .join('')
  return '<table><tbody>' + body + '</tbody></table>'
}

/* ------------------------------------------------------------------------- *
 * Selection geometry: walks in the feature's own index space.
 * ------------------------------------------------------------------------- */

/**
 * Columns in render order, the same [start, center, end] space
 * cellSelectionFeature resolves its bounds against.
 */
function getDataGridDisplayOrderedColumns<TData extends object>(
  table: DataGridTableInstance<TData>
) {
  return [
    ...table.getStartVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
    ...table.getEndVisibleLeafColumns()
  ]
}

function getDataGridWritableCellEdit<TData extends object>(
  column: {
    columnDef: { meta?: { cellEdit?: DataGridColumnCellEdit<TData> } }
  },
  /**
   * The row a write targets. Function-form `editable` is evaluated against
   * it; without a row the column counts as writable in principle, the
   * coarse check the fill preview's column filter uses.
   */
  row?: TData
): DataGridColumnCellEdit<TData> | null {
  const cellEdit = column.columnDef.meta?.cellEdit
  if (!cellEdit || cellEdit.editable === false) return null
  if (typeof cellEdit.editable === 'function' && row !== undefined && !cellEdit.editable(row)) {
    return null
  }
  return cellEdit
}

/**
 * Ids of the rows the view can actually show: the page slice plus rows the
 * DOM renders outside it (pinned rows under keepPinnedRows). Selection
 * bounds live in pre-paginated display order, so a range whose corners are
 * both visible can still span off-page rows in between - a page-boundary
 * range to a bottom-pinned draft is the standing example. Every batch walk
 * (copy, clear, paste, fill) filters rows through this set so the cells a
 * batch touches are exactly the cells the selection paints.
 */
function getDataGridRenderedRowIds<TData extends object>(
  table: DataGridTableInstance<TData>,
  viewport: HTMLElement | null | undefined
): Set<string> | null {
  if (!viewport) return null
  // When the page slice covers the whole display order (manual pagination,
  // virtualization, no pagination) no row can be off-page: skip the walk.
  if (table.getRowModel().rows.length === table.getRowsInDisplayOrder().length) {
    return null
  }
  const rendered = new Set<string>(table.getRowModel().rows.map((row: { id: string }) => row.id))
  for (const rowEl of Array.from(viewport.querySelectorAll('tbody tr[data-row-id]'))) {
    const id = rowEl.getAttribute('data-row-id')
    if (id) rendered.add(id)
  }
  return rendered
}

/**
 * Cells of the current selection the view can actually show, under the
 * same row filter the batch builders use, so a count shown next to the
 * selection always matches what is painted and what a batch will touch.
 * The feature's own getSelectedCellCount spans off-page rows instead.
 */
function getDataGridVisibleSelectedCellCount<TData extends object>(
  table: DataGridTableInstance<TData>,
  /** The grid's body viewport; null falls back to the full-range count. */
  viewport: HTMLElement | null
): number {
  const bounds = table.getCellSelectionBounds()
  if (!bounds.length) return 0
  const rows = table.getRowsInDisplayOrder()
  const columns = getDataGridDisplayOrderedColumns(table)
  const rendered = getDataGridRenderedRowIds(table, viewport)
  let count = 0
  for (const bound of bounds) {
    let rowCount = 0
    for (let r = bound.minRowIndex; r <= bound.maxRowIndex; r++) {
      const row = rows[r]
      if (row && (!rendered || rendered.has(row.id))) rowCount += 1
    }
    let columnCount = 0
    for (let c = bound.minColumnIndex; c <= bound.maxColumnIndex; c++) {
      const column = columns[c]
      if (column && column.columnDef.enableCellSelection !== false) {
        columnCount += 1
      }
    }
    count += rowCount * columnCount
  }
  return count
}

/**
 * The bound of the ACTIVE (most recent) region. getCellSelectionBounds()
 * sorts geometrically, so its last entry is merely the bottom-right
 * rectangle; the focused cell anchors the newest range, so the bound
 * containing it is the active one. Falls back to the geometric last when
 * the focused cell sits in no bound (the newest range was an exclude).
 */
function getDataGridActiveBound<TData extends object>(table: DataGridTableInstance<TData>) {
  const bounds = table.getCellSelectionBounds()
  if (!bounds.length) return null
  const focused = table.getFocusedCell()
  if (focused) {
    // O(1): v9 caches the display index on the row itself.
    const rowIndex = focused.row.getDisplayIndex()
    const columnIndex = getDataGridDisplayOrderedColumns(table).findIndex(
      (column) => column.id === focused.column.id
    )
    const containing = bounds.find(
      (bound) =>
        rowIndex >= bound.minRowIndex &&
        rowIndex <= bound.maxRowIndex &&
        columnIndex >= bound.minColumnIndex &&
        columnIndex <= bound.maxColumnIndex
    )
    if (containing) return containing
  }
  return bounds[bounds.length - 1] ?? null
}

/**
 * Resolves the cell one visual step away from a given cell: selectable
 * columns for horizontal, RENDERED row order for vertical. The feature's
 * own move/extend resolve rows through the page slice and stall on pinned
 * rows (a bottom-pinned draft), while id-addressed cells work everywhere.
 * "edge" means the step is at the grid boundary; null means the position
 * is not resolvable here and the caller should use the feature's move.
 */
function getDataGridStepTarget<TData extends object>(
  table: DataGridTableInstance<TData>,
  viewport: HTMLElement,
  from: { rowId: string; columnId: string },
  direction: 'up' | 'down' | 'left' | 'right'
): { rowId: string; columnId: string } | 'edge' | null {
  if (direction === 'left' || direction === 'right') {
    const selectable = getDataGridDisplayOrderedColumns(table).filter(
      (column) => column.columnDef.enableCellSelection !== false
    )
    const index = selectable.findIndex((column) => column.id === from.columnId)
    if (index === -1) return null
    const next = selectable[index + (direction === 'right' ? 1 : -1)]
    return next ? { rowId: from.rowId, columnId: next.id } : 'edge'
  }
  const renderedIds = Array.from(viewport.querySelectorAll('tbody tr[data-row-id]')).map((row) =>
    row.getAttribute('data-row-id')
  )
  const index = renderedIds.indexOf(from.rowId)
  if (index === -1) return null
  const nextId = renderedIds[index + (direction === 'down' ? 1 : -1)]
  return nextId ? { rowId: nextId, columnId: from.columnId } : 'edge'
}

/**
 * Shift+Arrow: the feature keeps focus on the anchor and grows the range
 * from its active corner. When its own extend cannot resolve the step
 * (the active corner sits on a pinned row, or the next visual row is a
 * pinned row outside the page slice), re-derive the active corner from
 * the bounds and step it in visual space through selectCellRange.
 */
function extendDataGridSelection<TData extends object>(
  table: DataGridTableInstance<TData>,
  viewport: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right'
): { rowId: string; columnId: string } | null {
  // The range's active corner: focus stays the anchor, so the corner is
  // the bound's opposite one. Returned to the caller so the view can
  // follow the growing edge rather than the anchor.
  const activeCorner = () => {
    const focused = table.getFocusedCell()
    if (!focused) return null
    const bound = getDataGridActiveBound(table)
    if (!bound) return null
    const rows = table.getRowsInDisplayOrder()
    const allColumns = getDataGridDisplayOrderedColumns(table)
    const rowIndex = focused.row.getDisplayIndex()
    const columnIndex = allColumns.findIndex((column) => column.id === focused.column.id)
    return {
      rowId:
        rows[rowIndex === bound.minRowIndex ? bound.maxRowIndex : bound.minRowIndex]?.id ??
        focused.row.id,
      columnId:
        allColumns[
          columnIndex === bound.minColumnIndex ? bound.maxColumnIndex : bound.minColumnIndex
        ]?.id ?? focused.column.id
    }
  }
  const boundKey = () => {
    const bounds = table.getCellSelectionBounds()
    const bound = bounds[bounds.length - 1]
    return bound
      ? `${bounds.length}:${bound.minRowIndex}-${bound.maxRowIndex}:${bound.minColumnIndex}-${bound.maxColumnIndex}`
      : 'none'
  }
  const before = boundKey()
  table.extendCellSelection(direction)
  if (boundKey() !== before) return activeCorner()
  const focused = table.getFocusedCell()
  if (!focused) return null
  const active = activeCorner() ?? {
    rowId: focused.row.id,
    columnId: focused.column.id
  }
  const target = getDataGridStepTarget(table, viewport, active, direction)
  if (!target || target === 'edge') return null
  table.selectCellRange(
    {
      anchorRowId: focused.row.id,
      anchorColumnId: focused.column.id,
      focusRowId: target.rowId,
      focusColumnId: target.columnId
    },
    { mode: 'replace' }
  )
  return target
}

/**
 * Serialization for clipboard/fill values without a formatter: primitives use
 * their native string form, objects use JSON instead of the meaningless
 * default `[object Object]` stringification.
 */
function getDataGridClipboardValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') return JSON.stringify(value)
  // Remaining: number | bigint | boolean | symbol | function — all have
  // meaningful native toString forms.
  switch (typeof value) {
    case 'number':
    case 'bigint':
    case 'symbol':
    case 'function':
      return value.toString()
    case 'boolean':
      return value ? 'true' : 'false'
    default:
      return ''
  }
}

/**
 * The active region as formatted strings, row-major. Columns opted out of
 * selection are compacted away, matching the feature's own ranges-data
 * behavior, and rows the view cannot show are skipped when a viewport is
 * given. Null when nothing is selected.
 */
function getDataGridActiveRegionGrid<TData extends object>(
  table: DataGridTableInstance<TData>,
  viewport?: HTMLElement | null
): string[][] | null {
  const bound = getDataGridActiveBound(table)
  if (!bound) return null

  const rows = table.getRowsInDisplayOrder()
  const columns = getDataGridDisplayOrderedColumns(table)
  const rendered = getDataGridRenderedRowIds(table, viewport)
  const grid: string[][] = []

  for (let r = bound.minRowIndex; r <= bound.maxRowIndex; r++) {
    const row = rows[r]
    if (!row || (rendered && !rendered.has(row.id))) continue
    const cells = row.getAllCellsByColumnId()
    const line: string[] = []
    for (let c = bound.minColumnIndex; c <= bound.maxColumnIndex; c++) {
      const column = columns[c]
      if (!column || column.columnDef.enableCellSelection === false) continue
      const value = cells[column.id]?.getValue()
      const format = column.columnDef.meta?.cellEdit?.format
      line.push(format ? format(value, row.original) : getDataGridClipboardValue(value))
    }
    grid.push(line)
  }

  return grid.length ? grid : null
}

/**
 * A clear/cut batch over the selection's writable cells. Non-writable columns
 * are skipped silently: clearing is an intent over what the grid owns, and a
 * rejection per read-only cell would be noise. Null when nothing clears.
 */
function buildDataGridClearDetails<TData extends object>(
  table: DataGridTableInstance<TData>,
  source: 'clear' | 'cut',
  activeRegionOnly: boolean,
  viewport?: HTMLElement | null
): DataGridCellsChangeDetails<TData> | null {
  const allBounds = table.getCellSelectionBounds()
  const activeBound = getDataGridActiveBound(table)
  const bounds = activeRegionOnly ? (activeBound ? [activeBound] : []) : allBounds
  if (!bounds.length) return null

  const rows = table.getRowsInDisplayOrder()
  const columns = getDataGridDisplayOrderedColumns(table)
  const rendered = getDataGridRenderedRowIds(table, viewport)
  const changes: DataGridCellChange<TData>[] = []

  for (const bound of bounds) {
    for (let r = bound.minRowIndex; r <= bound.maxRowIndex; r++) {
      const row = rows[r]
      if (!row || (rendered && !rendered.has(row.id))) continue
      const cells = row.getAllCellsByColumnId()
      for (let c = bound.minColumnIndex; c <= bound.maxColumnIndex; c++) {
        const column = columns[c]
        if (!column || column.columnDef.enableCellSelection === false) continue
        const cellEdit = getDataGridWritableCellEdit<TData>(column, row.original)
        if (!cellEdit) continue
        changes.push({
          rowId: row.id,
          columnId: column.id,
          row: row.original,
          previousValue: cells[column.id]?.getValue(),
          value: cellEdit.clearValue ?? null
        })
      }
    }
  }

  return changes.length ? { source, changes, rejected: [] } : null
}

interface DataGridPasteTarget {
  /** Display indexes of the pasted region's first and last row. */
  startRowIndex: number
  endRowIndex: number
  /** How many rows a paste actually wrote (hidden rows are skipped). */
  rowCount?: number
  /** Display indexes of the pasted region's first and last column. */
  startColumnIndex: number
  endColumnIndex: number
}

/**
 * Resolves a parsed clipboard block into a paste batch, Excel semantics:
 * a 1x1 block fills the whole selected region; a block tiles when the region
 * is an exact multiple of it; otherwise it pastes once from the region's
 * top-left, clamped at the grid edges (rows are never grown).
 */
function buildDataGridPasteDetails<TData extends object>(
  table: DataGridTableInstance<TData>,
  block: string[][],
  viewport?: HTMLElement | null
): {
  details: DataGridCellsChangeDetails<TData>
  target: DataGridPasteTarget
} | null {
  if (!block.length) return null
  const bound = getDataGridActiveBound(table)
  if (!bound) return null

  const rows = table.getRowsInDisplayOrder()
  const columns = getDataGridDisplayOrderedColumns(table)
  const rendered = getDataGridRenderedRowIds(table, viewport)

  // Copy COMPACTS opt-out columns away, so paste maps block columns over the
  // same compacted space: selectable columns only, starting at the region's
  // first selectable column and running past the region for a wider block,
  // clamped at the grid edge. Walking raw display offsets instead would let
  // an interior opt-out column swallow a block column silently.
  const targetColumns: Array<{
    column: (typeof columns)[number]
    displayIndex: number
  }> = []
  let regionColumns = 0
  for (let c = bound.minColumnIndex; c < columns.length; c++) {
    const column = columns[c]
    if (!column || column.columnDef.enableCellSelection === false) continue
    targetColumns.push({ column, displayIndex: c })
    if (c <= bound.maxColumnIndex) regionColumns += 1
  }
  if (!regionColumns) return null

  const blockRows = block.length
  const blockColumns = block.reduce((max, line) => Math.max(max, line.length), 1)
  const regionRows = bound.maxRowIndex - bound.minRowIndex + 1

  let rowCount: number
  let columnCount: number
  if (blockRows === 1 && blockColumns === 1) {
    rowCount = regionRows
    columnCount = regionColumns
  } else if (regionRows % blockRows === 0 && regionColumns % blockColumns === 0) {
    rowCount = regionRows
    columnCount = regionColumns
  } else {
    rowCount = blockRows
    columnCount = blockColumns
  }

  const tiled = tileDataGridClipboardBlock(block, rowCount, columnCount)
  const startRowIndex = bound.minRowIndex

  // Rows the block maps onto: the next rowCount rows the view can show,
  // starting at the region's top. Off-page rows between a page's tail and
  // a pinned draft are skipped rather than silently written.
  const targetRows: Array<{ row: (typeof rows)[number]; displayIndex: number }> = []
  for (let r = startRowIndex; r < rows.length; r++) {
    if (targetRows.length === rowCount) break
    const row = rows[r]
    if (!row || (rendered && !rendered.has(row.id))) continue
    targetRows.push({ row, displayIndex: r })
  }

  const changes: DataGridCellChange<TData>[] = []
  const rejected: DataGridCellRejection[] = []

  for (let r = 0; r < targetRows.length; r++) {
    const row = targetRows[r]!.row
    const cells = row.getAllCellsByColumnId()
    for (let c = 0; c < columnCount; c++) {
      const column = targetColumns[c]?.column
      if (!column) continue
      const raw = tiled[r]?.[c] ?? ''
      const cellEdit = getDataGridWritableCellEdit<TData>(column, row.original)
      if (!cellEdit) {
        rejected.push({
          rowId: row.id,
          columnId: column.id,
          raw,
          reason: 'readonly'
        })
        continue
      }
      const value = cellEdit.parse ? cellEdit.parse(raw, row.original) : raw
      if (value === undefined) {
        rejected.push({
          rowId: row.id,
          columnId: column.id,
          raw,
          reason: 'invalid'
        })
        continue
      }
      changes.push({
        rowId: row.id,
        columnId: column.id,
        row: row.original,
        previousValue: cells[column.id]?.getValue(),
        value
      })
    }
  }

  if (!changes.length && !rejected.length) return null
  const lastTarget = targetColumns[Math.min(columnCount, targetColumns.length) - 1]
  return {
    details: { source: 'paste', changes, rejected },
    target: {
      startRowIndex,
      endRowIndex: targetRows[targetRows.length - 1]?.displayIndex ?? startRowIndex,
      rowCount: targetRows.length,
      startColumnIndex: targetColumns[0]!.displayIndex,
      endColumnIndex: lastTarget!.displayIndex
    }
  }
}

/**
 * The inverse batch: every change's value and previousValue swapped and
 * rejections dropped. Feed it through the same state update onCellsChange
 * uses to implement undo; inverting the inverse is redo.
 */
function invertDataGridCellsChange<TData extends object>(
  details: DataGridCellsChangeDetails<TData>
): DataGridCellsChangeDetails<TData> {
  return {
    source: details.source,
    changes: details.changes.map((change) => ({
      ...change,
      value: change.previousValue,
      previousValue: change.value
    })),
    rejected: []
  }
}

function selectDataGridRegion<TData extends object>(
  table: DataGridTableInstance<TData>,
  target: DataGridPasteTarget
) {
  const rows = table.getRowsInDisplayOrder()
  const columns = getDataGridDisplayOrderedColumns(table)
  const anchorRow = rows[target.startRowIndex]
  const anchorColumn = columns[target.startColumnIndex]
  const focusRow = rows[Math.min(target.endRowIndex, rows.length - 1)]
  const focusColumn = columns[target.endColumnIndex]
  if (!anchorRow || !anchorColumn || !focusRow || !focusColumn) return
  table.selectCellRange(
    {
      anchorRowId: anchorRow.id,
      anchorColumnId: anchorColumn.id,
      focusRowId: focusRow.id,
      focusColumnId: focusColumn.id
    },
    { mode: 'replace' }
  )
}

/* ------------------------------------------------------------------------- *
 * Fill batch: pure, unit-testable. The drag session below only measures the pointer.
 * ------------------------------------------------------------------------- */

/** A row the view can show, with its index in the table's display order. */
interface DataGridFillRow<TData extends object> {
  row: ReturnType<DataGridTableInstance<TData>['getRowsInDisplayOrder']>[number]
  displayIndex: number
}

type DataGridFillAxis = 'row' | 'column'

/**
 * The source region in visible space: its rows, and the visible index of its last row
 * (-1 when the view shows none of them).
 */
function getDataGridFillSource<TData extends object>(
  bound: CellSelectionBounds,
  visibleRows: DataGridFillRow<TData>[]
) {
  const sourceRows = visibleRows.filter(
    ({ displayIndex }) => displayIndex >= bound.minRowIndex && displayIndex <= bound.maxRowIndex
  )
  const last = sourceRows[sourceRows.length - 1]
  return { sourceRows, sourceEndVisibleIndex: last ? visibleRows.indexOf(last) : -1 }
}

/**
 * The rows and columns an extension of `count` along `axis` reaches: rows in visible space, and
 * only the columns a commit would write, so the drag preview never tints a cell the release
 * skips.
 */
function getDataGridFillTargets<TData extends object>(
  table: DataGridTableInstance<TData>,
  bound: CellSelectionBounds,
  axis: DataGridFillAxis,
  count: number,
  visibleRows: DataGridFillRow<TData>[]
) {
  const columnEntries = getDataGridDisplayOrderedColumns(table).map((column, displayIndex) => ({
    column,
    displayIndex
  }))
  const fillable = ({ column }: (typeof columnEntries)[number]) =>
    column.columnDef.enableCellSelection !== false && !!getDataGridWritableCellEdit<TData>(column)
  const { sourceRows, sourceEndVisibleIndex } = getDataGridFillSource(bound, visibleRows)
  return axis === 'row'
    ? {
        rowEntries: visibleRows.slice(sourceEndVisibleIndex + 1, sourceEndVisibleIndex + 1 + count),
        columnEntries: columnEntries
          .slice(bound.minColumnIndex, bound.maxColumnIndex + 1)
          .filter(fillable)
      }
    : {
        rowEntries: sourceRows,
        columnEntries: columnEntries
          .slice(bound.maxColumnIndex + 1, bound.maxColumnIndex + 1 + count)
          .filter(fillable)
      }
}

/**
 * Resolves a fill drag into a batch: the source region repeated cyclically over `count` more
 * rows (down) or columns (right). A row fill copies raw values; a column fill is a type
 * boundary and round-trips through the source's format and the target's parse, the paste
 * contract, so a parse rejection lands in `rejected` while a cell that cannot be written is
 * skipped without one. `visibleRows` are the rows the view can show, in display order. Null
 * when the view shows no source row, or when a row fill has no row to write below it; a drag
 * onto columns nothing can write returns an empty batch, because the selection still grows.
 */
function buildDataGridFillDetails<TData extends object>(
  table: DataGridTableInstance<TData>,
  bound: CellSelectionBounds,
  axis: DataGridFillAxis,
  count: number,
  visibleRows: DataGridFillRow<TData>[]
): {
  details: DataGridCellsChangeDetails<TData>
  target: Omit<DataGridPasteTarget, 'rowCount'>
} | null {
  const { sourceRows, sourceEndVisibleIndex } = getDataGridFillSource(bound, visibleRows)
  if (sourceEndVisibleIndex === -1) return null
  const targets = getDataGridFillTargets(table, bound, axis, count, visibleRows)
  if (!targets.rowEntries.length) return null
  const columns = getDataGridDisplayOrderedColumns(table)

  const changes: DataGridCellChange<TData>[] = []
  const rejected: DataGridCellRejection[] = []

  if (axis === 'row') {
    for (let offset = 0; offset < targets.rowEntries.length; offset++) {
      const targetRow = targets.rowEntries[offset]!.row
      const sourceRow = sourceRows[offset % sourceRows.length]!.row
      const targetCells = targetRow.getAllCellsByColumnId()
      const sourceCells = sourceRow.getAllCellsByColumnId()
      for (const { column } of targets.columnEntries) {
        if (!getDataGridWritableCellEdit<TData>(column, targetRow.original)) continue
        changes.push({
          rowId: targetRow.id,
          columnId: column.id,
          row: targetRow.original,
          previousValue: targetCells[column.id]?.getValue(),
          value: sourceCells[column.id]?.getValue()
        })
      }
    }
  } else {
    const regionColumns = bound.maxColumnIndex - bound.minColumnIndex + 1
    for (const { row } of targets.rowEntries) {
      const cells = row.getAllCellsByColumnId()
      for (const { column: targetColumn, displayIndex } of targets.columnEntries) {
        const offset = displayIndex - (bound.maxColumnIndex + 1)
        const sourceColumn = columns[bound.minColumnIndex + (offset % regionColumns)]
        if (!sourceColumn) continue
        const targetEdit = getDataGridWritableCellEdit<TData>(targetColumn, row.original)
        if (!targetEdit) continue
        const sourceValue = cells[sourceColumn.id]?.getValue()
        let value: unknown = sourceValue
        // Crossing columns is a type boundary: round-trip through the source's format and
        // the target's parse, exactly what pasting the same cells would do. Same-column
        // fills keep raw values.
        if (targetColumn.id !== sourceColumn.id && targetEdit.parse) {
          const sourceFormat = sourceColumn.columnDef.meta?.cellEdit?.format
          const raw = sourceFormat
            ? sourceFormat(sourceValue, row.original)
            : getDataGridClipboardValue(sourceValue)
          const parsed = targetEdit.parse(raw, row.original)
          if (parsed === undefined) {
            rejected.push({ rowId: row.id, columnId: targetColumn.id, raw, reason: 'invalid' })
            continue
          }
          value = parsed
        }
        changes.push({
          rowId: row.id,
          columnId: targetColumn.id,
          row: row.original,
          previousValue: cells[targetColumn.id]?.getValue(),
          value
        })
      }
    }
  }

  return {
    details: { source: 'fill', changes, rejected },
    target: {
      startRowIndex: bound.minRowIndex,
      endRowIndex:
        axis === 'row'
          ? targets.rowEntries[targets.rowEntries.length - 1]!.displayIndex
          : bound.maxRowIndex,
      startColumnIndex: bound.minColumnIndex,
      endColumnIndex: bound.maxColumnIndex + (axis === 'column' ? count : 0)
    }
  }
}

/* ------------------------------------------------------------------------- *
 * Fill handle drag session.
 * ------------------------------------------------------------------------- */

/**
 * Imperative document-level session, the column-resize pattern: preview state
 * is written as `data-cell-fill-target` attributes outside React, so the drag
 * costs zero re-renders until release. v1 fills down or right (dominant axis)
 * by repeating the source region's values; rows outside the rendered
 * viewport of a virtualized body cannot be targeted mid-drag.
 *
 * Vertical distance is measured over the rows the view can show, so a drag
 * onto a pinned draft fills exactly the rows the preview marked and never
 * the off-page rows between. A cross-column fill round-trips through the
 * source's format and the target's parse - the paste contract - because
 * adjacent grid columns are heterogeneous; a parse rejection lands in the
 * batch's rejected list, while cells that cannot be written are skipped
 * and never tinted by the preview.
 */
function startDataGridFillSession<TData extends object>(options: {
  table: DataGridTableInstance<TData>
  viewport: HTMLElement
  onCellsChange: ((details: DataGridCellsChangeDetails<TData>) => void) | null
}) {
  const { table, viewport, onCellsChange } = options
  // Fill over a multi-region selection is undefined territory; Excel refuses
  // it too.
  if (table.getCellSelectionBounds().length > 1) return
  const bound = getDataGridActiveBound(table)
  if (!bound) return

  const rows = table.getRowsInDisplayOrder()
  const columns = getDataGridDisplayOrderedColumns(table)
  // The vertical walk space: rows the view can show, in display order. The
  // DOM ids seed it (a drag can only target rendered rows), and one pass
  // over the cached display array resolves them without building per-row
  // wrappers for a 50k-row model.
  const domRowIds = new Set<string>()
  for (const rowEl of Array.from(viewport.querySelectorAll('tbody tr[data-row-id]'))) {
    const id = rowEl.getAttribute('data-row-id')
    if (id) domRowIds.add(id)
  }
  const visibleRows: DataGridFillRow<TData>[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    if (domRowIds.has(row.id)) {
      visibleRows.push({ row, displayIndex: i })
    }
  }
  const visibleIndexById = new Map(visibleRows.map((entry, index) => [entry.row.id, index]))
  const { sourceRows, sourceEndVisibleIndex } = getDataGridFillSource(bound, visibleRows)
  if (sourceEndVisibleIndex === -1) return
  const columnIndexById = new Map(columns.map((column, index) => [column.id, index]))

  let extension: { axis: 'row' | 'column'; count: number } | null = null
  let previewCells: Element[] = []

  const previewOutline = viewport.ownerDocument.createElement('div')
  previewOutline.setAttribute('data-slot', 'data-grid-cell-fill-preview')
  previewOutline.className = dataGridGestureOutlineClassName
  previewOutline.style.display = 'none'
  viewport.appendChild(previewOutline)
  viewport.setAttribute('data-cell-filling', '')

  // The region border wraps source plus extension: its corners are the
  // source region's first cell and the farthest cell the drag reaches
  // (the source's own last cell while nothing is extended).
  const sourceCorner = (rowId: string, columnId: string | undefined) =>
    columnId
      ? viewport.querySelector(
          `tr[data-row-id="${CSS.escape(rowId)}"] td[data-col-id="${CSS.escape(columnId)}"]`
        )
      : null
  const positionPreviewOutline = () => {
    const first = sourceRows.length
      ? sourceCorner(sourceRows[0]!.row.id, columns[bound.minColumnIndex]?.id)
      : null
    const lastSource = sourceRows.length
      ? sourceCorner(sourceRows[sourceRows.length - 1]!.row.id, columns[bound.maxColumnIndex]?.id)
      : null
    const far = previewCells.length ? previewCells[previewCells.length - 1]! : lastSource
    if (!first || !far) {
      previewOutline.style.display = 'none'
      return
    }
    const firstRect = first.getBoundingClientRect()
    const farRect = far.getBoundingClientRect()
    const viewportRect = viewport.getBoundingClientRect()
    const left = Math.min(firstRect.left, farRect.left)
    const top = Math.min(firstRect.top, farRect.top)
    previewOutline.style.display = 'block'
    previewOutline.style.left = `${left - viewportRect.left + viewport.scrollLeft}px`
    previewOutline.style.top = `${top - viewportRect.top + viewport.scrollTop}px`
    previewOutline.style.width = `${Math.max(firstRect.right, farRect.right) - left}px`
    previewOutline.style.height = `${Math.max(firstRect.bottom, farRect.bottom) - top}px`
  }

  const clearPreview = () => {
    for (const cell of previewCells) {
      cell.removeAttribute('data-cell-fill-target')
      cell.classList.remove(dataGridFillTargetClassNames.base, dataGridFillTargetClassNames.pinned)
    }
    previewCells = []
    positionPreviewOutline()
  }

  const getExtensionTargets = () =>
    extension
      ? getDataGridFillTargets(table, bound, extension.axis, extension.count, visibleRows)
      : null

  const applyPreview = () => {
    clearPreview()
    const targets = getExtensionTargets()
    if (!targets) return
    for (const { row } of targets.rowEntries) {
      const rowElement = viewport.querySelector(`tr[data-row-id="${CSS.escape(row.id)}"]`)
      if (!rowElement) continue
      for (const { column } of targets.columnEntries) {
        if (!getDataGridWritableCellEdit<TData>(column, row.original)) continue
        const cellElement = rowElement.querySelector(`td[data-col-id="${CSS.escape(column.id)}"]`)
        if (!cellElement) continue
        cellElement.setAttribute('data-cell-fill-target', 'true')
        // StyleX counterpart of the source's `data-[cell-fill-target]:bg-primary/4`
        // and its pinned variant: the tint classes are toggled alongside the
        // attribute, which is written outside React.
        cellElement.classList.add(dataGridFillTargetClassNames.base)
        if (cellElement.hasAttribute('data-pinned')) {
          cellElement.classList.add(dataGridFillTargetClassNames.pinned)
        }
        previewCells.push(cellElement)
      }
    }

    positionPreviewOutline()
  }

  const handleMove = (event: MouseEvent) => {
    const element = document.elementFromPoint(event.clientX, event.clientY)
    const cellElement = element?.closest?.('td[data-col-id]')
    const rowElement = cellElement?.closest?.('tr[data-row-id]')
    if (!cellElement || !rowElement || !viewport.contains(cellElement)) return

    const rowVisibleIndex = visibleIndexById.get(rowElement.getAttribute('data-row-id') ?? '')
    const columnIndex = columnIndexById.get(cellElement.getAttribute('data-col-id') ?? '')
    if (rowVisibleIndex === undefined || columnIndex === undefined) return

    const rowsDelta = Math.max(0, rowVisibleIndex - sourceEndVisibleIndex)
    const columnsDelta = Math.max(0, columnIndex - bound.maxColumnIndex)
    const next: typeof extension =
      rowsDelta === 0 && columnsDelta === 0
        ? null
        : rowsDelta >= columnsDelta
          ? { axis: 'row', count: rowsDelta }
          : { axis: 'column', count: columnsDelta }

    if (next?.axis === extension?.axis && next?.count === extension?.count) {
      return
    }
    extension = next
    applyPreview()
  }

  const finish = (commit: boolean) => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
    document.removeEventListener('keydown', handleKey, true)
    clearPreview()
    previewOutline.remove()
    viewport.removeAttribute('data-cell-filling')
    if (!commit || !extension || !onCellsChange) return
    const result = buildDataGridFillDetails(
      table,
      bound,
      extension.axis,
      extension.count,
      visibleRows
    )
    if (!result) return
    const { details, target } = result
    if (details.changes.length || details.rejected.length) onCellsChange(details)

    // Grow the selection over source plus filled cells, Excel's post-fill shape.
    selectDataGridRegion(table, target)
  }

  const handleUp = () => finish(true)
  // Capture phase so a cancel cannot also reach the grid's own Escape
  // handling and clear the selection underneath the drag.
  const handleKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    finish(false)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
  document.addEventListener('keydown', handleKey, true)
}

export {
  buildDataGridClearDetails,
  buildDataGridFillDetails,
  buildDataGridPasteDetails,
  extendDataGridSelection,
  getDataGridActiveBound,
  getDataGridActiveRegionGrid,
  getDataGridClipboardValue,
  getDataGridDisplayOrderedColumns,
  getDataGridStepTarget,
  getDataGridVisibleSelectedCellCount,
  getDataGridWritableCellEdit,
  invertDataGridCellsChange,
  parseDataGridClipboardText,
  renderDataGridClipboardHtml,
  selectDataGridRegion,
  serializeDataGridClipboardText,
  startDataGridFillSession,
  tileDataGridClipboardBlock
}
export type {
  DataGridCellSelectionApi,
  DataGridEditorAdvance,
  DataGridEditorSession,
  DataGridFocusCellOptions,
  DataGridPasteTarget
}
