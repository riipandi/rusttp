import { ChevronDown, Pin } from '@keyline-icons/react'
import { Pin as PinFilled } from '@keyline-icons/react/fill'
import * as stylex from '@stylexjs/stylex'
import type { StyleXStyles } from '@stylexjs/stylex'
import { flexRender, Subscribe } from '@tanstack/react-table'
import type { Cell, Column, Row } from '@tanstack/react-table'
import { Fragment, memo, useMemo, useRef } from 'react'
import type { ReactNode, Ref } from 'react'
import { Checkbox } from '../base/checkbox'
import { Spinner } from '../extra/spinner'
import { glyphSize } from '../styles/glyph'
import { focusRing } from '../styles/utils.stylex'
import {
  getDataGridCellSelectionCellAttrs,
  toDataGridDomId,
  getDataGridRowLabel,
  useDataGrid
} from './data-grid'
import type { DataGridFeatures, DataGridRowStatus, DataGridTableInstance } from './data-grid'
import {
  cellSelectionChromeProps,
  getDataGridTreeIndentStyle,
  assignRef,
  getDataGridTableResolvedRows,
  getDataGridTableOrderedVisibleColumns,
  getDataGridTableOrderedVisibleCells,
  hasDataGridTableRightPinnedColumns,
  getPinningStyles,
  DataGridTableFillBodyCell,
  DataGridTableFillFootCell
} from './data-grid-table-utils'
import type {
  DataGridCellSelectionAttrs,
  DataGridTablePinnedBoundary
} from './data-grid-table-utils'
import { dataGridTableStyles as s } from './data-grid-table.stylex'

function DataGridTableRowSpacer() {
  return (
    <tbody
      aria-hidden='true'
      data-slot='data-grid-table-body-spacer'
      {...stylex.props(s.bodySpacer)}
    />
  )
}

function DataGridTableBody({ children }: { children: ReactNode }) {
  return <tbody data-slot='data-grid-table-body'>{children}</tbody>
}

function DataGridTableFoot({ children }: { children: ReactNode }) {
  const { props } = useDataGrid()
  return (
    <tfoot data-slot='data-grid-table-foot' {...stylex.props(props.tableStyles?.footer)}>
      {children}
    </tfoot>
  )
}

function DataGridTableFootRow<TData extends object>({
  children,
  table
}: {
  children: ReactNode
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()

  return (
    <tr
      data-slot='data-grid-table-foot-row'
      {...stylex.props(
        props.tableLayout?.footerBackground && s.footRowBackground,
        props.tableLayout?.cellBorder && s.cellBorder
      )}
    >
      {children}
      <DataGridTableFillFootCell table={table} />
    </tr>
  )
}

function DataGridTableFootRowCell({
  children,
  colSpan,
  style
}: {
  children?: ReactNode
  colSpan?: number
  style?: StyleXStyles
}) {
  const { props } = useDataGrid()
  return (
    <td
      colSpan={colSpan}
      data-dense={props.tableLayout?.dense ? '' : undefined}
      {...stylex.props(
        s.footCell,
        props.tableLayout?.footerBackground && s.footRowBackground,
        props.tableLayout?.cellBorder && s.cellBorder,
        style
      )}
    >
      {children}
    </td>
  )
}

function DataGridTableBodyRowSkeleton({
  children,
  wantsBorder,
  stripe,
  style
}: {
  children: ReactNode
  wantsBorder?: boolean
  /** Striping parity under `tableLayout.stripped` (see DataGridTableBodyRow). */
  stripe?: boolean
  style?: StyleXStyles
}) {
  const { props } = useDataGrid()

  return (
    <tr
      style={{ '--dg-row-border-b': wantsBorder ? '1px' : '0px' }}
      data-dense={props.tableLayout?.dense ? '' : undefined}
      {...stylex.props(
        s.row,
        props.onRowClick && s.rowHoverCursor,
        props.tableLayout?.cellBorder && s.cellBorder,
        props.tableLayout?.stripped && (stripe ? s.cellStripedOddHover : s.rowStriped),
        props.tableStyles?.bodyRow,
        style
      )}
    >
      {children}
    </tr>
  )
}

function DataGridTableBodyRowSkeletonCell<TData extends object>({
  children,
  column,
  table
}: {
  children: ReactNode
  column: Column<DataGridFeatures, TData>
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()

  return (
    <td
      style={
        props.tableLayout?.columnsResizable
          ? { width: `calc(var(--col-${column.id}-size) * 1px)` }
          : undefined
      }
      data-dense={props.tableLayout?.dense ? '' : undefined}
      data-pinned={column.getIsPinned() || undefined}
      {...stylex.props(
        s.td,
        props.tableLayout?.cellBorder && s.cellBorder,
        props.tableLayout?.cellBorder &&
          props.tableLayout?.columnsResizable &&
          // With end-pinned columns but no pin affordance, the pinned edge
          // draws no separator of its own; keep the border then.
          (props.tableLayout?.columnsPinnable || !hasDataGridTableRightPinnedColumns(table)) &&
          !column.getIsPinned() &&
          column.getIsLastColumn('center') &&
          s.cellBorderLast,
        props.tableLayout?.columnsResizable && column.getCanResize() && s.tdTruncate,
        column.columnDef.meta?.cellStyle,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          column.getIsPinned() &&
          s.tdPinned,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          column.getIsPinned() === 'start' &&
          column.getIsLastColumn('start') &&
          s.tdPinnedDividerStart,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          column.getIsPinned() === 'end' &&
          column.getIsFirstColumn('end') &&
          s.tdPinnedDividerEnd,
        (column.getIndex() === 0 ||
          column.getIndex() === table.getVisibleLeafColumns().length - 1) &&
          props.tableStyles?.edgeCell
      )}
    >
      {children}
    </td>
  )
}

function DataGridTableBodyRow<TData extends object>({
  children,
  row,
  pinnedBoundary,
  rowRef,
  dndRef,
  dndStyle,
  dataIndex,
  stripe,
  wantsBorder,
  table
}: {
  children: ReactNode
  row: Row<DataGridFeatures, TData>
  pinnedBoundary?: DataGridTablePinnedBoundary
  rowRef?: Ref<HTMLTableRowElement>
  dndRef?: Ref<HTMLTableRowElement>
  dndStyle?: StyleXStyles
  dataIndex?: number
  /**
   * Striping parity under `tableLayout.stripped`: true paints the alternating
   * tint, false/undefined keeps the row clear. Computed from a React-known
   * index so virtual rows stripe by absolute position.
   */
  stripe?: boolean
  /** Whether this row paints a bottom border on its tds. */
  wantsBorder?: boolean
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid<TData>()
  const isRowPinned = row.getIsPinned()
  const rowStatus = props.getRowStatus?.(row.original)

  return (
    <tr
      ref={(node) => {
        assignRef(rowRef, node)
        assignRef(dndRef, node)
      }}
      style={{
        '--dg-row-border-b': wantsBorder ? '1px' : '0px'
      }}
      data-state={table.options.enableRowSelection && row.getIsSelected() ? 'selected' : undefined}
      data-index={dataIndex}
      data-row-id={row.id}
      data-depth={row.depth || undefined}
      data-row-pinned={isRowPinned || undefined}
      data-row-pinned-boundary={pinnedBoundary}
      data-row-status={rowStatus}
      // 1-based after the header row; row.index is the position in the data,
      // so the announced index stays absolute across pagination.
      aria-rowindex={props.tableLayout?.cellSelection ? row.index + 2 : undefined}
      onClick={() => props.onRowClick && props.onRowClick(row.original)}
      {...stylex.props(
        s.row,
        props.onRowClick && s.rowHoverCursor,
        // Optional CRUD indications, active only when getRowStatus is
        // wired; the muted defaults yield to tableStyles overrides per
        // status. Pinned cells must stay OPAQUE (they hide scrolled
        // content), so they get the same tint pre-mixed over the
        // background instead of inheriting the translucent row fill.
        rowStatus === 'deleted' && s.rowStatusDeleted,
        rowStatus === 'dirty' && s.rowStatusDirty,
        rowStatus === 'new' && s.rowStatusNew,
        // Striped rows: the tinted rows keep a solid hover, the clear rows
        // drop the base hover entirely. Pinned tint wins.
        props.tableLayout?.stripped && (stripe ? s.cellStripedOddHover : s.rowStriped),
        props.tableLayout?.rowsPinnable && isRowPinned && s.rowPinnedTint,
        props.tableStyles?.bodyRow,
        rowStatus === 'new' && props.tableStyles?.rowNew,
        rowStatus === 'dirty' && props.tableStyles?.rowDirty,
        rowStatus === 'deleted' && props.tableStyles?.rowDeleted,
        props.tableLayout?.rowsPinnable && isRowPinned && props.tableStyles?.rowPinned,
        dndStyle
      )}
      data-dense={props.tableLayout?.dense ? '' : undefined}
    >
      {children}
    </tr>
  )
}

function DataGridTableBodyRowExpandded<TData extends object>({
  row
}: {
  row: Row<DataGridFeatures, TData>
}) {
  const { props } = useDataGrid<TData>()
  const { table } = row
  const expandedContent = table
    .getAllColumns()
    .find((column) => column.columnDef.meta?.expandedContent)?.columnDef.meta?.expandedContent

  // Tree and grouped rows share row.getIsExpanded() with detail expansion.
  // Without a detail column there is nothing to render, and an empty <tr>
  // would break striping parity, rowBorder, and virtual row measurement.
  if (!expandedContent) return null

  return (
    <tr data-slot='data-grid-table-expanded-row'>
      <td
        colSpan={
          getDataGridTableOrderedVisibleCells(row).length +
          (props.tableLayout?.columnsResizable ? 1 : 0)
        }
      >
        {expandedContent(row.original)}
      </td>
    </tr>
  )
}

/**
 * Expanded detail row for a body row.
 *
 * Like the selection cell below, this reads a row method that hides its state
 * dependency (`row.getIsExpanded()`) from the React Compiler. Rendered under
 * `DataGridTableRenderedRow` it receives a *stable* row object, so without a
 * visible dependency the compiler memoizes the whole `expanded && <…>` branch
 * on row identity alone and an expansion click never inserts the detail row.
 * Subscribing to the `expanded` atom gives the compiler (and React) a
 * dependency that actually changes, re-running the branch on toggle.
 */
function DataGridTableBodyRowExpandedSlot<TData extends object>({
  row,
  table
}: {
  row: Row<DataGridFeatures, TData>
  table: DataGridTableInstance<TData>
}) {
  const tableInstance = table ?? row.table
  return (
    <Subscribe source={tableInstance.atoms.expanded}>
      {() => (row.getIsExpanded() ? <DataGridTableBodyRowExpandded row={row} /> : null)}
    </Subscribe>
  )
}

/**
 * Interactive descendants keep their own mousedown semantics: a click on a
 * button, link, editor or checkbox inside a cell must never start or replace
 * a range. One selector also covers the row-dnd grip (a button), the expand
 * toggle, and `data-cell-interactive` - the documented opt-out for custom
 * widgets built from elements the tag list cannot know about.
 */
function isDataGridCellInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(
      'button, a, input, select, textarea, [contenteditable], [role="checkbox"], [data-cell-interactive], [data-slot="data-grid-table-row-expand"], [data-slot="data-grid-cell-fill-handle"]'
    ) != null
  )
}

function DataGridTableBodyRowCell<TData extends object>({
  children,
  cell,
  dndRef,
  dndStyle,
  columnIndex,
  isFirstRow,
  isLastRow,
  nextPinned,
  prevPinned,
  nextIsFillCell,
  rowSelected,
  rowStatus,
  table
}: {
  children: ReactNode
  cell: Cell<DataGridFeatures, TData>
  dndRef?: Ref<HTMLTableCellElement>
  dndStyle?: StyleXStyles
  /** Center-column index under column virtualization; data-column-index. */
  columnIndex?: number
  /** Cell-selection boundary clamps (row position). */
  isFirstRow?: boolean
  isLastRow?: boolean
  /** Cell-selection boundary clamps (pinned neighbors / filler strip). */
  nextPinned?: boolean
  prevPinned?: boolean
  nextIsFillCell?: boolean
  /** Pre-mixed pinned tints, resolved by the row. */
  rowSelected?: boolean
  rowStatus?: DataGridRowStatus | undefined
  table: DataGridTableInstance<TData>
}) {
  const { props, gridId } = useDataGrid<TData>()

  const { column, row } = cell
  const isPinned = column.getIsPinned()
  const isLastStartPinned = isPinned === 'start' && column.getIsLastColumn('start')
  const isFirstEndPinned = isPinned === 'end' && column.getIsFirstColumn('end')
  const isLastCenter = column.getIsLastColumn('center')

  // The atom check backs up the flag: consumers may hand the grid a leaner
  // bundle without cellSelectionFeature, and the flag alone must not make the
  // renderer call prototype APIs that were never assigned.
  const cellSelectionOn = !!props.tableLayout?.cellSelection && table.atoms.cellSelection != null
  const rangeSelectionOn = cellSelectionOn && props.tableLayout?.cellSelectionMode !== 'single'

  const renderTd = (selection: DataGridCellSelectionAttrs | null) => (
    <td
      ref={dndRef}
      // The id is what the controller's aria-activedescendant points at, so
      // a screen reader tracks the focused cell through the container-focus
      // model.
      id={
        cellSelectionOn
          ? `${gridId}c-${toDataGridDomId(row.id)}-${toDataGridDomId(column.id)}`
          : undefined
      }
      aria-colindex={cellSelectionOn ? column.getIndex() + 1 : undefined}
      data-col-id={column.id}
      data-dense={props.tableLayout?.dense ? '' : undefined}
      data-pinned={isPinned || undefined}
      data-last-col={isLastStartPinned ? 'start' : isFirstEndPinned ? 'end' : undefined}
      data-cell-status={props.getCellStatus?.(row.original, column.id)}
      data-column-index={columnIndex}
      style={{
        ...(props.tableLayout?.columnsPinnable && column.getCanPin() && getPinningStyles(column)),
        // Paint containment clips at the padding edge, which would erase
        // the ::before selection chrome on pinned cells.
        ...(cellSelectionOn ? { contain: undefined } : null),
        ...(props.tableLayout?.columnsResizable && {
          width: `calc(var(--col-${column.id}-size) * 1px)`
        })
      }}
      {...(selection ? selection : null)}
      onMouseDown={
        selection
          ? (event) => {
              if (event.button !== 0) return
              if (isDataGridCellInteractiveTarget(event.target)) {
                // A modifier click is a SELECTION gesture even on a control:
                // Shift extends and Ctrl/Cmd adds, exactly as on a plain
                // cell, so no column is unreachable for ranges.
                if (
                  rangeSelectionOn &&
                  (event.shiftKey || event.metaKey || event.ctrlKey) &&
                  cell.getCanSelect()
                ) {
                  event.preventDefault()
                  cell.getSelectionStartHandler()(event)
                  return
                }
                // The press starts the range session exactly like a plain
                // cell: the cell focuses, a drag extends from it, and a
                // motionless press still ends in the control's own click
                // (this is why drag releases are squelched upstream, in the
                // controller, once a drag actually grew the range).
                if (cell.getCanSelect()) {
                  if (rangeSelectionOn) {
                    cell.getSelectionStartHandler()(event)
                  } else {
                    table.setFocusedCell(row.id, column.id)
                  }
                }
                return
              }
              if (!rangeSelectionOn) {
                // Single mode: every gesture collapses to the one cell.
                if (cell.getCanSelect()) {
                  table.setFocusedCell(row.id, column.id)
                }
                return
              }
              cell.getSelectionStartHandler()(event)
            }
          : undefined
      }
      onMouseEnter={
        rangeSelectionOn ? (event) => cell.getSelectionExtendHandler()(event) : undefined
      }
      {...stylex.props(
        s.td,
        props.tableLayout?.cellBorder && s.cellBorder,
        // Mirror of the head cell rule: no floating border against the
        // resize filler strip.
        props.tableLayout?.cellBorder &&
          props.tableLayout?.columnsResizable &&
          // With end-pinned columns but no pin affordance, the pinned edge
          // draws no separator of its own; keep the border then.
          (props.tableLayout?.columnsPinnable || !hasDataGridTableRightPinnedColumns(table)) &&
          !isPinned &&
          isLastCenter &&
          s.cellBorderLast,
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          !cellSelectionOn &&
          s.tdTruncate,
        props.tableLayout?.columnsPinnable && column.getCanPin() && isPinned && s.tdPinned,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          isPinned === 'start' &&
          isLastStartPinned &&
          s.tdPinnedDividerStart,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          isPinned === 'end' &&
          isFirstEndPinned &&
          s.tdPinnedDividerEnd,
        // The classic edited-cell corner mark, active only when
        // getCellStatus is wired: warning for "dirty", critical for "invalid".
        props.getCellStatus && rowStatus && s.cellStatusMark,
        props.getCellStatus && rowStatus === 'dirty' && s.cellStatusMarkDirty,
        // CRUD status tints, pre-mixed over the background on pinned cells.
        rowStatus === 'deleted' && s.cellStatusDeleted,
        rowStatus === 'dirty' && isPinned && s.cellStatusDirtyPinned,
        rowStatus === 'new' && isPinned && s.cellStatusNewPinned,
        // Pinned cells pre-mix the row's selected tint (they are opaque and
        // would hide the translucent row fill).
        rowSelected && isPinned && s.pinnedCellSelectedMix,
        column.columnDef.meta?.cellStyle,
        (column.getIndex() === 0 || column.getIndex() === row.getVisibleCells().length - 1) &&
          props.tableStyles?.edgeCell,
        ...cellSelectionChromeProps(selection, {
          isFirstColumn: column.getIndex() === 0,
          isLastColumn: column.getIndex() === row.getVisibleCells().length - 1,
          isFirstRow: !!isFirstRow,
          isLastRow: !!isLastRow,
          nextPinned: !!nextPinned,
          prevPinned: !!prevPinned,
          nextIsFillCell: !!nextIsFillCell
        }),
        dndStyle
      )}
    >
      {/* With cell selection on, the td must not clip (its ::before paints
          the selection chrome 1px outside the cell), so the resize
          truncation moves to an inner wrapper that clips at the same
          boundary the td used to. */}
      {cellSelectionOn && props.tableLayout?.columnsResizable && column.getCanResize() ? (
        <div
          data-dense={props.tableLayout?.dense ? '' : undefined}
          {...stylex.props(s.truncateWrap)}
        >
          {children}
        </div>
      ) : (
        children
      )}
      {props.tableLayout?.cellFillHandle &&
        selection?.['data-cell-edge-bottom'] &&
        selection['data-cell-edge-right'] && (
          <span
            data-slot='data-grid-cell-fill-handle'
            /* "dot" stays fully inside the cell corner; "ring" rides the
               corner point the way Sheets draws it. Either way the handle
               clamps where straddling would break: at the grid's own
               boundary (last row, last cell, a last cell followed only by
               the filler strip), where an overhang would extend the scroll
               content and clip the selection chrome, and beside a PINNED
               column, whose sticky layer (z 30) would otherwise paint over
               the straddling half - raising the handle instead would float
               it above the pinned column during horizontal scroll. */
            {...stylex.props(
              s.fillHandle,
              props.tableLayout?.cellFillHandleVariant === 'ring'
                ? [
                    s.fillHandleRing,
                    (isLastRow || nextPinned || nextIsFillCell) && s.fillHandleRingClampEnd,
                    isLastRow && s.fillHandleRingClampBottom
                  ]
                : props.tableLayout?.cellFillHandleVariant === 'square'
                  ? /* Abutting the cell borders from inside: no gap and no
                       overlap, so the square cannot merge with a gridline
                       into a wider-than-tall blob, and it can never leave
                       the grid, which is why it needs no boundary clamps. */
                    s.fillHandleSquare
                  : s.fillHandleDot,
              props.tableStyles?.cellFillHandle
            )}
          />
        )}
    </td>
  )

  if (!cellSelectionOn) return renderTd(null)

  // Per-cell subscription with a projecting selector: the atom writes once
  // per cell crossed during a drag, and shallow-comparing this tuple limits
  // the re-render to cells whose selection state actually changed.
  return (
    <Subscribe
      source={table.atoms.cellSelection}
      selector={() => getDataGridCellSelectionCellAttrs(cell)}
    >
      {(selection) => renderTd(selection)}
    </Subscribe>
  )
}

function DataGridTableRenderedRow<TData extends object>({
  row,
  pinnedBoundary,
  rowRef,
  rowIndex,
  stripe,
  wantsBorder,
  isFirstRow,
  isLastRow,
  centerWindow,
  table
}: {
  row: Row<DataGridFeatures, TData>
  pinnedBoundary?: DataGridTablePinnedBoundary
  rowRef?: Ref<HTMLTableRowElement>
  /** Virtualized list index, rendered as data-index for measureElement. */
  rowIndex?: number
  /**
   * Striping parity override. When omitted, a virtualized row derives
   * it from the absolute `rowIndex`.
   */
  stripe?: boolean
  /** Whether this row paints a bottom border on its tds. */
  wantsBorder?: boolean
  /** Cell-selection overlay clamps: this row's DOM position. */
  isFirstRow?: boolean
  isLastRow?: boolean
  /**
   * Column-virtualization window over the CENTER cells: only the inclusive
   * [start, end] slice renders, and each flank collapses into one colSpan
   * spacer. The spacers carry no width of their own - the colgroup stays
   * complete, so under table-fixed the browser sizes them from the col
   * elements they span and the layout cannot drift.
   */
  centerWindow?: { start: number; end: number }
  table: DataGridTableInstance<TData>
}) {
  const fragmentRef = useRef(null)
  const { props } = useDataGrid<TData>()
  const startVisibleCells = row.getStartVisibleCells()
  const centerVisibleCells = row.getCenterVisibleCells()
  const endVisibleCells = row.getEndVisibleCells()
  const hasRightPinnedColumns = hasDataGridTableRightPinnedColumns(table)
  const windowedCenterCells = centerWindow
    ? centerVisibleCells.slice(centerWindow.start, centerWindow.end + 1)
    : centerVisibleCells
  const leadingSpacerSpan = centerWindow ? centerWindow.start : 0
  const trailingSpacerSpan = centerWindow
    ? Math.max(0, centerVisibleCells.length - 1 - centerWindow.end)
    : 0
  const orderedCells = [...startVisibleCells, ...centerVisibleCells, ...endVisibleCells]
  const rowSelected = row.getIsSelected()
  const rowStatus = props.getRowStatus?.(row.original)
  const resizableWithRightPinned = props.tableLayout?.columnsResizable && hasRightPinnedColumns
  const resizableWithoutRightPinned = props.tableLayout?.columnsResizable && !hasRightPinnedColumns

  // Cell-selection chrome clamps: neighbors and row position, resolved once
  // per row and threaded into the cells.
  const neighborFlags = (index: number) => ({
    prevPinned: index > 0 ? !!orderedCells[index - 1]?.column.getIsPinned() : false,
    nextPinned:
      index < orderedCells.length - 1 ? !!orderedCells[index + 1]?.column.getIsPinned() : false,
    nextIsFillCell:
      props.tableLayout?.columnsResizable &&
      index === orderedCells.length - 1 &&
      // The filler cell follows the last cell of the grid (either directly,
      // or after the center group when end columns are pinned).
      true
  })

  return (
    <Fragment ref={fragmentRef}>
      <DataGridTableBodyRow
        row={row}
        table={table}
        pinnedBoundary={pinnedBoundary}
        rowRef={rowRef}
        dataIndex={rowIndex}
        stripe={stripe ?? (typeof rowIndex === 'number' ? rowIndex % 2 === 0 : undefined)}
        wantsBorder={wantsBorder}
      >
        {startVisibleCells.map((cell, index) => (
          <DataGridTableBodyRowCell
            cell={cell}
            table={table}
            key={cell.id}
            isFirstRow={isFirstRow}
            isLastRow={isLastRow}
            nextPinned={neighborFlags(index).nextPinned}
            prevPinned={neighborFlags(index).prevPinned}
            nextIsFillCell={neighborFlags(index).nextIsFillCell}
            rowSelected={rowSelected}
            rowStatus={rowStatus}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </DataGridTableBodyRowCell>
        ))}
        {leadingSpacerSpan > 0 && (
          <td
            aria-hidden='true'
            data-slot='data-grid-table-virtual-col-spacer'
            colSpan={leadingSpacerSpan}
          />
        )}
        {windowedCenterCells.map((cell, cellIndex) => (
          <DataGridTableBodyRowCell
            cell={cell}
            table={table}
            key={cell.id}
            columnIndex={centerWindow ? centerWindow.start + cellIndex : undefined}
            isFirstRow={isFirstRow}
            isLastRow={isLastRow}
            nextPinned={neighborFlags(startVisibleCells.length + cellIndex).nextPinned}
            prevPinned={neighborFlags(startVisibleCells.length + cellIndex).prevPinned}
            nextIsFillCell={neighborFlags(startVisibleCells.length + cellIndex).nextIsFillCell}
            rowSelected={rowSelected}
            rowStatus={rowStatus}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </DataGridTableBodyRowCell>
        ))}
        {trailingSpacerSpan > 0 && (
          <td
            aria-hidden='true'
            data-slot='data-grid-table-virtual-col-spacer'
            colSpan={trailingSpacerSpan}
          />
        )}
        {resizableWithRightPinned ? <DataGridTableFillBodyCell table={table} /> : null}
        {endVisibleCells.map((cell) => (
          <DataGridTableBodyRowCell
            cell={cell}
            table={table}
            key={cell.id}
            isFirstRow={isFirstRow}
            isLastRow={isLastRow}
            rowSelected={rowSelected}
            rowStatus={rowStatus}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </DataGridTableBodyRowCell>
        ))}
        {resizableWithoutRightPinned ? <DataGridTableFillBodyCell table={table} /> : null}
      </DataGridTableBodyRow>
      <DataGridTableBodyRowExpandedSlot row={row} table={table} />
    </Fragment>
  )
}

function DataGridTableEmpty<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { labels, props } = useDataGrid()
  const visibleColumnCount =
    getDataGridTableOrderedVisibleColumns(table).length +
    (props.tableLayout?.columnsResizable ? 1 : 0)

  return (
    <tr>
      <td colSpan={Math.max(visibleColumnCount, 1)} {...stylex.props(s.emptyCell)}>
        {props.emptyMessage || labels.empty}
      </td>
    </tr>
  )
}

function DataGridTableLoader() {
  const { labels, props } = useDataGrid()

  return (
    <div {...stylex.props(s.loaderWrap)}>
      <div {...stylex.props(s.loaderCard)}>
        <Spinner style={s.loaderSpinner} />
        {props.loadingMessage || labels.loading}
      </div>
    </div>
  )
}

/**
 * Row pin toggle.
 *
 * Same React Compiler trap as the expanded-row slot: `row.getIsPinned()`
 * hides its state dependency from the compiler, and the stable row object
 * lets it memoize the aria/icon branch forever (the pin click updates the
 * state but the button never repaints). Subscribing to the row-pinning atom
 * gives the branch a dependency that changes on pin/unpin.
 */
function DataGridTableRowPin<TData extends object>({
  row,
  table
}: {
  row: Row<DataGridFeatures, TData>
  table: DataGridTableInstance<TData>
}) {
  const grid = useDataGrid<TData>()
  const { labels } = grid
  const rowLabel = getDataGridRowLabel(row, grid)

  // `table` arrives through the caller's threaded prop; the row itself always
  // knows its table, so a call site that has not threaded the prop yet (or a
  // compiler-memoized cell evaluated before the caller's assignment) still
  // resolves a valid instance instead of crashing on `.atoms` of undefined.
  const tableInstance = table ?? row.table

  return (
    <Subscribe source={tableInstance.atoms.rowPinning}>
      {() => {
        const isPinned = row.getIsPinned()

        return (
          <button
            type='button'
            aria-label={isPinned ? labels.unpinRow(rowLabel) : labels.pinRow(rowLabel)}
            data-pinned={isPinned ? 'true' : undefined}
            onClick={(event) => {
              // Pinning must not bubble into the row's onRowClick handler.
              event.stopPropagation()

              if (isPinned) {
                row.pin(false)
              } else {
                row.pin('top')
              }
            }}
            {...stylex.props(focusRing.root, s.rowPinButton)}
          >
            {isPinned ? (
              <PinFilled size={glyphSize.small} aria-hidden />
            ) : (
              <Pin size={glyphSize.small} strokeWidth={2} aria-hidden />
            )}
          </button>
        )
      }}
    </Subscribe>
  )
}

/**
 * Selection cell.
 *
 * The `Subscribe` wrapper is the v9 fix for React Compiler, and it is why this
 * file no longer needs `"use no memo"`. `useTable` hands back a fresh table on
 * every state change, which covers anything read through `table`, but this
 * component reads selection through `row.getIsSelected()` - a builder call
 * that hides its state dependency from the compiler. Rendered inside a column
 * `cell` template it receives a *stable* row, so the compiler is free to
 * memoize this JSX and never re-run those reads, which shows up as checkboxes
 * that do not respond to clicks.
 *
 * Subscribing to the row-selection atom gives the compiler a dependency it can
 * see. Note the standalone `Subscribe` rather than `table.Subscribe`: inside a
 * cell template the `table` handed to the column def is the core `Table`, which
 * has no `Subscribe` attached.
 */
function DataGridTableRowSelect<TData extends object>({
  row
}: {
  row: Row<DataGridFeatures, TData>
}) {
  const grid = useDataGrid<TData>()
  const { labels } = grid
  const rowLabel = getDataGridRowLabel(row, grid)
  return (
    <Subscribe source={row.table.atoms.rowSelection}>
      {() => (
        <>
          <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected() && !row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value)}
            onClick={(event) => {
              // Selection must not bubble into the row's onRowClick handler.
              event.stopPropagation()
            }}
            aria-label={labels.selectRow(rowLabel)}
          />
        </>
      )}
    </Subscribe>
  )
}

function DataGridTableRowSelectAll<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { labels, recordCount, isLoading } = useDataGrid()

  // `getIsSomePageRowsSelected()` means "at least one" in v9, where v8 meant
  // "some but not all", so the all-selected case has to be excluded explicitly
  // or the header checkbox stays indeterminate once every row is checked.
  return (
    <Subscribe source={table.atoms.rowSelection}>
      {() => {
        const isAllSelected = table.getIsAllPageRowsSelected()
        const isSomeSelected = table.getIsSomePageRowsSelected()

        return (
          <Checkbox
            checked={isAllSelected}
            indeterminate={isSomeSelected && !isAllSelected}
            disabled={isLoading || recordCount === 0}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
            aria-label={labels.selectAll}
          />
        )
      }}
    </Subscribe>
  )
}

function DataGridTableRowExpand<TData extends object>({
  row,
  indent = 20,
  style,
  children
}: {
  row: Row<DataGridFeatures, TData>
  /** Horizontal offset in px applied per tree depth level. */
  indent?: number
  style?: StyleXStyles
  /** Custom toggle icon; replaces the default chevron. */
  children?: ReactNode
}) {
  const grid = useDataGrid<TData>()
  const { labels, props } = grid
  const rowLabel = getDataGridRowLabel(row, grid)
  const isExpanded = row.getIsExpanded()

  return (
    <span
      data-slot='data-grid-table-row-expand'
      style={getDataGridTreeIndentStyle(row, indent)}
      {...stylex.props(s.rowExpand, style)}
    >
      {row.getCanExpand() ? (
        <button
          type='button'
          aria-expanded={isExpanded}
          aria-label={isExpanded ? labels.collapseRow(rowLabel) : labels.expandRow(rowLabel)}
          data-dense={props.tableLayout?.dense ? '' : undefined}
          onClick={(event) => {
            // Expansion must not bubble into the row's onRowClick handler.
            event.stopPropagation()
            row.toggleExpanded()
          }}
          {...stylex.props(focusRing.root, s.rowExpandButton)}
        >
          {children ?? (
            <ChevronDown
              size={glyphSize.small}
              strokeWidth={2}
              aria-hidden
              {...stylex.props(s.rowExpandChevron, !isExpanded && s.rowExpandChevronCollapsed)}
            />
          )}
        </button>
      ) : (
        // Leaf spacer: compact by design so leaf content sits near the
        // parent label instead of a full toggle width deeper.
        <span aria-hidden='true' {...stylex.props(s.rowExpandLeafSpacer)} />
      )}
    </span>
  )
}

interface DataGridTableBodyRowsProps<TData extends object> {
  table: DataGridTableInstance<TData>
  /** A tfoot directly follows this tbody: the last row keeps its border. */
  hasFollowingFooter?: boolean
}

function DataGridTableBodyRows<TData extends object>({
  table,
  hasFollowingFooter
}: DataGridTableBodyRowsProps<TData>) {
  const { labels, isLoading, props } = useDataGrid()
  const pagination = table.state.pagination

  if (isLoading && props.loadingMode === 'skeleton' && pagination?.pageSize) {
    const leftVisibleColumns = table.getStartVisibleLeafColumns()
    const centerVisibleColumns = table.getCenterVisibleLeafColumns()
    const rightVisibleColumns = table.getEndVisibleLeafColumns()
    const hasRightPinnedColumns = hasDataGridTableRightPinnedColumns(table)

    return (
      <>
        {Array.from(
          { length: pagination.pageSize },
          (_, rowIndex) => `skeleton-row-${rowIndex}`
        ).map((rowKey, rowIndex) => (
          <DataGridTableBodyRowSkeleton
            key={rowKey}
            stripe={rowIndex % 2 === 0}
            wantsBorder={props.tableLayout?.rowBorder && rowIndex < pagination.pageSize - 1}
          >
            {[...leftVisibleColumns, ...centerVisibleColumns].map((column) => (
              <DataGridTableBodyRowSkeletonCell column={column} table={table} key={column.id}>
                {column.columnDef.meta?.skeleton}
              </DataGridTableBodyRowSkeletonCell>
            ))}
            {props.tableLayout?.columnsResizable && hasRightPinnedColumns ? (
              <DataGridTableFillBodyCell table={table} />
            ) : null}
            {rightVisibleColumns.map((column) => (
              <DataGridTableBodyRowSkeletonCell column={column} table={table} key={column.id}>
                {column.columnDef.meta?.skeleton}
              </DataGridTableBodyRowSkeletonCell>
            ))}
            {props.tableLayout?.columnsResizable && !hasRightPinnedColumns ? (
              <DataGridTableFillBodyCell table={table} />
            ) : null}
          </DataGridTableBodyRowSkeleton>
        ))}
      </>
    )
  }

  if (isLoading && props.loadingMode === 'spinner') {
    return (
      <tr>
        <td
          colSpan={
            table.getVisibleFlatColumns().length + (props.tableLayout?.columnsResizable ? 1 : 0)
          }
          {...stylex.props(s.loadingCell)}
        >
          <div {...stylex.props(s.loadingInner)}>
            <Spinner style={s.loaderSpinner} />
            <span {...stylex.props(s.loadingText)}>{props.loadingMessage || labels.loading}</span>
          </div>
        </td>
      </tr>
    )
  }

  const resolvedRows = getDataGridTableResolvedRows(table, props.tableLayout?.rowsPinnable)

  if (!resolvedRows.length) return <DataGridTableEmpty table={table} />

  return (
    <>
      {resolvedRows.map(({ row, pinnedBoundary }, index) => (
        <DataGridTableRenderedRow
          key={row.id}
          row={row}
          table={table}
          pinnedBoundary={pinnedBoundary}
          stripe={props.tableLayout?.stripped ? index % 2 === 0 : undefined}
          wantsBorder={
            !!props.tableLayout?.rowBorder &&
            !props.tableLayout?.stripped &&
            (index < resolvedRows.length - 1 || hasFollowingFooter)
          }
        />
      ))}
    </>
  )
}

/**
 * Memoized body rows: skip re-renders during active column resize.
 * Column widths update via CSS variables on the <table> element,
 * so the browser handles width changes without React re-renders.
 * A cell-selection drag gets the same treatment: the root re-renders once per
 * cell crossed, but painting goes through each cell's own Subscribe, so row
 * reconciliation during the drag is pure waste.
 *
 * React.memo instantiates a generic component's TData to its constraint, so
 * the memoized element type is created inside the caller's generic scope
 * (`useMemoBodyRows`), where the memo identity stays stable per instance.
 */
function useMemoBodyRows<TData extends object>() {
  return useMemo(
    () =>
      memo(
        (bodyRowsProps: DataGridTableBodyRowsProps<TData>) => (
          <DataGridTableBodyRows {...bodyRowsProps} />
        ),
        (_prev, next) => !!next.table.state.columnResizing.isResizingColumn
      ),
    []
  )
}

export {
  DataGridTableRowSpacer,
  DataGridTableBody,
  DataGridTableFoot,
  DataGridTableFootRow,
  DataGridTableFootRowCell,
  DataGridTableBodyRowSkeleton,
  DataGridTableBodyRowSkeletonCell,
  DataGridTableBodyRow,
  DataGridTableBodyRowExpandded,
  DataGridTableBodyRowCell,
  DataGridTableRenderedRow,
  DataGridTableEmpty,
  DataGridTableLoader,
  DataGridTableRowPin,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
  DataGridTableRowExpand,
  useMemoBodyRows
}
