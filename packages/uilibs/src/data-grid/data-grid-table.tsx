import { Plus } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import { flexRender } from '@tanstack/react-table'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import type { CSSProperties, ReactNode, Ref } from 'react'
import { Button } from '../base/button'
import { useDataGrid } from './data-grid'
import type { DataGridTableInstance } from './data-grid'
import {
  DataGridTableRowSpacer,
  DataGridTableBody,
  DataGridTableFoot,
  useMemoBodyRows
} from './data-grid-table-body'
import {
  DataGridTableHead,
  DataGridTableHeadRow,
  DataGridTableHeadRowCell,
  DataGridTableHeadRowCellResize,
  DataGridTableResizeIndicator
} from './data-grid-table-head'
import {
  assignRef,
  getDataGridScrollAreaViewport,
  getDataGridTableMergedHeaderGroups,
  hasDataGridTableRightPinnedColumns,
  DataGridTableFillCol,
  DataGridTableFillHeadCell
} from './data-grid-table-utils'
import { dataGridTableViewportStyles, dataGridTableStyles as s } from './data-grid-table.stylex'

/**
 * The quick-create affordance, rendered as the body's last row when
 * `onRowCreate` is set: one full-width ghost button, the Notion/Airtable
 * "+ New" idiom. What the click creates stays consumer-owned.
 */
function DataGridTableAddRow<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { i18n, props } = useDataGrid()

  if (!props.onRowCreate) return null

  return (
    <tr data-slot='data-grid-table-add-row' {...stylex.props(props.tableStyles?.rowCreate)}>
      <td
        // The extra column is the filler strip, rendered only when columns
        // are resizable.
        colSpan={
          table.getVisibleLeafColumns().length + (props.tableLayout?.columnsResizable ? 1 : 0)
        }
        {...stylex.props(s.addRowCell)}
      >
        <Button
          type='button'
          variant='ghost'
          size='small'
          data-dense={props.tableLayout?.dense ? '' : undefined}
          style={[s.addRowButton, props.tableLayout?.dense && s.addRowButtonDense]}
          onClick={(event) => {
            // Creating often unmounts this affordance (a draft row takes
            // its place); focus would fall to the body and strand the
            // keyboard. Hand it to the grid's focus target instead - but
            // only when it was actually lost, so a consumer that keeps
            // the button mounted keeps repeated Enter presses working.
            // A timer, not rAF: timers also run in background tabs.
            const button = event.currentTarget
            const grid = button.closest('table')
            props.onRowCreate?.()
            setTimeout(() => {
              if (
                !button.isConnected &&
                grid?.isConnected &&
                grid.tabIndex >= 0 &&
                (document.activeElement === document.body || !document.activeElement)
              ) {
                grid.focus()
              }
            }, 0)
          }}
        >
          <Plus aria-hidden='true' {...stylex.props(s.addRowIcon)} />
          {props.rowCreateLabel ?? i18n.labels.rowCreate}
        </Button>
      </td>
    </tr>
  )
}

function DataGridTableBase<TData extends object>({
  children,
  table
}: {
  children: ReactNode
  table: DataGridTableInstance<TData>
}) {
  const { props, recordCount } = useDataGrid()
  const leftVisibleColumns = table.getStartVisibleLeafColumns()
  const centerVisibleColumns = table.getCenterVisibleLeafColumns()
  const rightVisibleColumns = table.getEndVisibleLeafColumns()
  const hasRightPinnedColumns = hasDataGridTableRightPinnedColumns(table)

  /**
   * Compute column widths as CSS custom properties once upfront (memoized).
   * Cells reference these via calc(var(--col-X-size) * 1px) so the browser
   * handles width propagation without per-cell getSize() calls or React
   * re-renders of the body.
   */
  const columnSizeVars = useMemo(() => {
    if (!props.tableLayout?.columnsResizable) return undefined
    const headers = table.getFlatHeaders()
    // `table` is a per-state-change wrapper (v9), so the memo recomputes on
    // every sizing, visibility, order, pinning or column-def change - exactly
    // the events that can move the CSS variables. No narrower re-key is
    // possible: getFlatHeaders() reads through the current instance.
    // A meta.fillWidth column absorbs the filler strip: its size variable
    // carries the unitless fill amount, so every consumer of
    // calc(var(--col-X-size) * 1px) stretches with the container while the
    // fill cells collapse to zero.
    const fillColumnId = table
      .getVisibleLeafColumns()
      .find((column) => column.columnDef.meta?.fillWidth)?.id
    const colSizes: Record<string, number | string> = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] =
        header.column.id === fillColumnId
          ? `calc(${header.column.getSize()} + var(--data-grid-fill, 0))`
          : header.column.getSize()
    }
    return colSizes
  }, [props.tableLayout?.columnsResizable, table])

  // With cell selection on, the table announces as a grid so the tds compute
  // as gridcells and aria-selected applies; existing grids keep their plain
  // semantic table untouched.
  const cellSelectionOn = !!props.tableLayout?.cellSelection && table.atoms.cellSelection != null

  return (
    <table
      data-slot='data-grid-table'
      role={cellSelectionOn ? 'grid' : undefined}
      aria-multiselectable={
        cellSelectionOn && props.tableLayout?.cellSelectionMode !== 'single' ? true : undefined
      }
      // recordCount can undercount the rows actually present (a pinned
      // draft row a consumer keeps out of its totals), and aria-rowindex
      // is computed from the full display order; the union keeps every
      // announced index inside the announced count.
      aria-rowcount={
        cellSelectionOn
          ? Math.max(recordCount, table.getRowsInDisplayOrder().length) + 1
          : undefined
      }
      style={
        props.tableLayout?.columnsResizable
          ? {
              ...columnSizeVars,
              width: `calc(${table.getTotalSize()}px + var(--data-grid-fill-size, 0px))`
            }
          : undefined
      }
      {...stylex.props(
        s.table,
        props.tableLayout?.columnsResizable ? s.tableSized : s.tableFull,
        props.tableLayout?.width === 'auto' ? s.tableAuto : s.tableFixed,
        !props.tableLayout?.columnsDraggable && s.tableSeparate,
        props.tableStyles?.base
      )}
    >
      <colgroup>
        {[...leftVisibleColumns, ...centerVisibleColumns].map((column) => (
          <col
            key={column.id}
            style={
              props.tableLayout?.columnsResizable
                ? { width: `calc(var(--col-${column.id}-size) * 1px)` }
                : props.tableLayout?.width === 'fixed'
                  ? { width: column.getSize() }
                  : undefined
            }
          />
        ))}
        {hasRightPinnedColumns ? <DataGridTableFillCol table={table} /> : null}
        {rightVisibleColumns.map((column) => (
          <col
            key={column.id}
            style={
              props.tableLayout?.columnsResizable
                ? { width: `calc(var(--col-${column.id}-size) * 1px)` }
                : props.tableLayout?.width === 'fixed'
                  ? { width: column.getSize() }
                  : undefined
            }
          />
        ))}
        {!hasRightPinnedColumns ? <DataGridTableFillCol table={table} /> : null}
      </colgroup>
      {children}
    </table>
  )
}

function DataGridTableViewport<TData extends object>({
  children,
  viewportRef,
  style,
  table
}: {
  children: ReactNode
  viewportRef?: Ref<HTMLDivElement>
  style?: CSSProperties
  table: DataGridTableInstance<TData>
}) {
  const { props, autoSize } = useDataGrid()
  const isColumnsResizable = !!props.tableLayout?.columnsResizable
  const viewportNodeRef = useRef<HTMLDivElement | null>(null)
  const fillStateRef = useRef({ containerWidth: 0, appliedFill: -1 })
  const stopContainerObserverRef = useRef<(() => void) | null>(null)

  // Free space is written as a CSS variable directly on the viewport node
  // instead of React state, so container resizes and column-size commits
  // reach the fill column without re-rendering the grid.
  const syncFillWidth = useCallback(() => {
    const node = viewportNodeRef.current
    if (!node) return

    const freeSpace = fillStateRef.current.containerWidth - table.getTotalSize()
    const fillWidth = Math.max(0, freeSpace)

    if (fillStateRef.current.appliedFill !== fillWidth) {
      fillStateRef.current.appliedFill = fillWidth
      node.style.setProperty('--data-grid-fill-size', `${fillWidth}px`)
      // Unitless twin for the meta.fillWidth column, whose size variable
      // participates in a calc that multiplies by 1px afterwards.
      node.style.setProperty('--data-grid-fill', String(fillWidth))
    }

    // Signed on purpose: a shrinking container drives the free space
    // NEGATIVE, which is exactly what tells a meta.autoSize column to hand
    // its absorbed width back.
    autoSize?.apply(freeSpace)
  }, [autoSize, table])

  const handleViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      stopContainerObserverRef.current?.()
      stopContainerObserverRef.current = null
      viewportNodeRef.current = node
      assignRef(viewportRef, node)

      if (!node) return

      if (!isColumnsResizable) {
        fillStateRef.current.appliedFill = -1
        node.style.removeProperty('--data-grid-fill-size')
        node.style.removeProperty('--data-grid-fill')
        return
      }

      const scrollViewport = getDataGridScrollAreaViewport(node) ?? node.parentElement
      const measurementTarget = scrollViewport ?? node

      const measure = () => {
        fillStateRef.current.containerWidth = measurementTarget.clientWidth
        syncFillWidth()
      }

      // First measure runs inside the mount commit, before paint, so the fill
      // column and any meta.autoSize growth land in the first painted frame.
      measure()

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(measure)
        observer.observe(measurementTarget)
        stopContainerObserverRef.current = () => observer.disconnect()
      }
    },
    [isColumnsResizable, syncFillWidth, viewportRef]
  )

  // Column sizing commits and visibility changes alter the table's total size
  // without moving the container, so the fill var must re-sync after renders
  // the ResizeObserver never sees. No-ops when the value is unchanged.
  useLayoutEffect(() => {
    if (!isColumnsResizable) return
    syncFillWidth()
  })

  return (
    <div
      data-slot='data-grid-table-viewport'
      ref={handleViewportRef}
      style={{
        ...(isColumnsResizable
          ? {
              width: `calc(${table.getTotalSize()}px + var(--data-grid-fill-size, 0px))`
            }
          : undefined),
        ...style
      }}
      {...stylex.props(dataGridTableViewportStyles.viewport)}
    >
      {children}
      <DataGridTableResizeIndicator viewportNodeRef={viewportNodeRef} table={table} />
    </div>
  )
}

function DataGridTableHeader<TData extends object>({
  table
}: {
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()
  const mergedHeaderGroups = getDataGridTableMergedHeaderGroups(table)
  const hasRightPinnedColumns = hasDataGridTableRightPinnedColumns(table)

  return (
    <DataGridTableViewport table={table}>
      <DataGridTableBase table={table}>
        <DataGridTableHead>
          {mergedHeaderGroups.map((headerGroup) => {
            return (
              <DataGridTableHeadRow key={headerGroup.id} rowId={headerGroup.id}>
                {headerGroup.headers
                  .filter((header) => header.column.getIsPinned() !== 'end')
                  .map((header) => {
                    const { column } = header

                    return (
                      <DataGridTableHeadRowCell header={header} table={table} key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {props.tableLayout?.columnsResizable && column.getCanResize() && (
                          <DataGridTableHeadRowCellResize header={header} table={table} />
                        )}
                      </DataGridTableHeadRowCell>
                    )
                  })}
                {props.tableLayout?.columnsResizable && hasRightPinnedColumns ? (
                  <DataGridTableFillHeadCell table={table} />
                ) : null}
                {headerGroup.headers
                  .filter((header) => header.column.getIsPinned() === 'end')
                  .map((header) => {
                    const { column } = header

                    return (
                      <DataGridTableHeadRowCell header={header} table={table} key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {props.tableLayout?.columnsResizable && column.getCanResize() && (
                          <DataGridTableHeadRowCellResize header={header} table={table} />
                        )}
                      </DataGridTableHeadRowCell>
                    )
                  })}
                {props.tableLayout?.columnsResizable && !hasRightPinnedColumns ? (
                  <DataGridTableFillHeadCell table={table} />
                ) : null}
              </DataGridTableHeadRow>
            )
          })}
        </DataGridTableHead>
      </DataGridTableBase>
    </DataGridTableViewport>
  )
}

function DataGridTable<TData extends object>({
  footerContent,
  renderHeader = true,
  table
}: {
  footerContent?: ReactNode
  renderHeader?: boolean
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()
  const BodyRowsMemo = useMemoBodyRows<TData>()
  const mergedHeaderGroups = getDataGridTableMergedHeaderGroups(table)
  const hasRightPinnedColumns = hasDataGridTableRightPinnedColumns(table)

  return (
    <DataGridTableViewport table={table}>
      <DataGridTableBase table={table}>
        {renderHeader && (
          <DataGridTableHead>
            {mergedHeaderGroups.map((headerGroup) => {
              return (
                <DataGridTableHeadRow key={headerGroup.id} rowId={headerGroup.id}>
                  {headerGroup.headers
                    .filter((header) => header.column.getIsPinned() !== 'end')
                    .map((header) => {
                      const { column } = header

                      return (
                        <DataGridTableHeadRowCell header={header} table={table} key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {props.tableLayout?.columnsResizable && column.getCanResize() && (
                            <DataGridTableHeadRowCellResize header={header} table={table} />
                          )}
                        </DataGridTableHeadRowCell>
                      )
                    })}
                  {props.tableLayout?.columnsResizable && hasRightPinnedColumns ? (
                    <DataGridTableFillHeadCell table={table} />
                  ) : null}
                  {headerGroup.headers
                    .filter((header) => header.column.getIsPinned() === 'end')
                    .map((header) => {
                      const { column } = header

                      return (
                        <DataGridTableHeadRowCell header={header} table={table} key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {props.tableLayout?.columnsResizable && column.getCanResize() && (
                            <DataGridTableHeadRowCellResize header={header} table={table} />
                          )}
                        </DataGridTableHeadRowCell>
                      )
                    })}
                  {props.tableLayout?.columnsResizable && !hasRightPinnedColumns ? (
                    <DataGridTableFillHeadCell table={table} />
                  ) : null}
                </DataGridTableHeadRow>
              )
            })}
          </DataGridTableHead>
        )}

        {renderHeader && (props.tableLayout?.stripped || !props.tableLayout?.rowBorder) && (
          <DataGridTableRowSpacer />
        )}

        <DataGridTableBody>
          <BodyRowsMemo table={table} hasFollowingFooter={!!footerContent} />
          {props.appendRow}
          <DataGridTableAddRow table={table} />
        </DataGridTableBody>

        {footerContent && <DataGridTableFoot>{footerContent}</DataGridTableFoot>}
      </DataGridTableBase>
    </DataGridTableViewport>
  )
}

export {
  DataGridTableAddRow,
  DataGridTableBase,
  DataGridTableViewport,
  DataGridTableHeader,
  DataGridTable
}
