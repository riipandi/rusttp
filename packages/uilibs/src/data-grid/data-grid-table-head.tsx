import * as stylex from '@stylexjs/stylex'
import type { StyleXStyles } from '@stylexjs/stylex'
import type { Header } from '@tanstack/react-table'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode, Ref, RefObject } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent
} from 'react'
import { getColumnHeaderLabel, getDataGridHeaderDomId, useDataGrid } from './data-grid'
import type { DataGridFeatures, DataGridTableInstance } from './data-grid'
import {
  hasDataGridTableRightPinnedColumns,
  getPinningStyles,
  nextColumnSize
} from './data-grid-table-utils'
import { dataGridTableStyles as s } from './data-grid-table.stylex'

type DataGridResizeStartEvent = ReactMouseEvent<HTMLElement> | ReactTouchEvent<HTMLElement>

type DataGridResizeDocumentEvent = globalThis.MouseEvent | globalThis.TouchEvent

function isDataGridTouchEvent(
  event: DataGridResizeStartEvent | DataGridResizeDocumentEvent
): event is ReactTouchEvent<HTMLElement> | globalThis.TouchEvent {
  return 'touches' in event
}

interface DataGridTouchListLike {
  length: number
  item: (index: number) => { identifier: number; clientX: number } | null
}

function findTouchClientX(list: DataGridTouchListLike, identifier: number) {
  for (let i = 0; i < list.length; i++) {
    const touch = list.item(i)
    if (touch && touch.identifier === identifier) return touch.clientX
  }

  return undefined
}

function getDataGridResizeEventClientX(
  event: DataGridResizeStartEvent | DataGridResizeDocumentEvent,
  touchIdentifier?: number
) {
  if (isDataGridTouchEvent(event)) {
    if (typeof touchIdentifier === 'number') {
      return (
        findTouchClientX(event.touches, touchIdentifier) ??
        findTouchClientX(event.changedTouches, touchIdentifier)
      )
    }

    return event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX
  }

  return event.clientX
}

function startDataGridColumnResizeOnEnd<TData extends object>(
  event: DataGridResizeStartEvent,
  header: Header<DataGridFeatures, TData>,
  table: DataGridTableInstance<TData>,
  /**
   * Live mode: per-move width updates go straight to the table element's
   * `--col/--header` variables, so cells track the pointer with ZERO React
   * renders; state is written twice per drag (start marker, release commit)
   * instead of per mousemove - which re-renders the consumer's whole tree.
   */
  live = false
): (() => void) | undefined {
  const column = table.getColumn(header.column.id)

  if (!column || !column.getCanResize()) return undefined
  const isTouchSession = isDataGridTouchEvent(event)
  if (isTouchSession && event.touches.length > 1) return undefined

  event.persist?.()

  const ownerDocument = event.currentTarget.ownerDocument
  const ownerWindow = ownerDocument.defaultView
  const previousBodyCursor = ownerDocument.body.style.cursor
  const previousDocumentCursor = ownerDocument.documentElement.style.cursor
  const startSize = header.getSize()
  // Track the initiating finger so a second touch cannot move or commit the
  // resize with the wrong clientX.
  const touchIdentifier = isTouchSession ? event.touches[0]?.identifier : undefined
  const dragStartClientX = getDataGridResizeEventClientX(event, touchIdentifier)
  const headerCell = event.currentTarget.closest('th')
  const headerRect = headerCell?.getBoundingClientRect()
  const liveTableElement = live ? headerCell?.closest('table') : null
  // An end-pinned column is anchored at its end edge and grows from its
  // START edge, so its whole resize geometry runs mirrored, exactly like
  // RTL: the anchor is the opposite edge and the drag direction inverts.
  const resizeRtl =
    (table.options.columnResizeDirection === 'rtl') !== (column.getIsPinned() === 'end')
  const startOffset =
    headerRect && Number.isFinite(resizeRtl ? headerRect.left : headerRect.right)
      ? resizeRtl
        ? headerRect.left
        : headerRect.right
      : dragStartClientX

  if (typeof dragStartClientX !== 'number' || typeof startOffset !== 'number') {
    return undefined
  }

  ownerDocument.body.style.cursor = 'col-resize'
  ownerDocument.documentElement.style.cursor = 'col-resize'

  const columnSizingStart = header
    .getLeafHeaders()
    .map((leafHeader) => [leafHeader.column.id, leafHeader.column.getSize()] as [string, number])
  const directionMultiplier = resizeRtl ? -1 : 1

  // Clamp the drag to the leaf columns' min/max sizes so the preview
  // indicator matches what the commit will produce (no overshoot followed by
  // a snap-back on release). columnDef always carries resolved defaults.
  let minDeltaPercentage = -0.999999
  let maxDeltaPercentage = Number.POSITIVE_INFINITY
  columnSizingStart.forEach(([columnId, headerSize]) => {
    if (headerSize <= 0) return

    const leafColumn = table.getColumn(columnId)
    const minSize = leafColumn?.columnDef.minSize
    const maxSize = leafColumn?.columnDef.maxSize

    if (typeof minSize === 'number') {
      minDeltaPercentage = Math.max(minDeltaPercentage, minSize / headerSize - 1)
    }
    if (typeof maxSize === 'number' && Number.isFinite(maxSize)) {
      maxDeltaPercentage = Math.min(maxDeltaPercentage, maxSize / headerSize - 1)
    }
  })

  let lastClientX = dragStartClientX
  let ended = false
  const stopListeners: Array<() => void> = []

  const updateOffset = (clientXPos?: number, commit = false) => {
    if (typeof clientXPos !== 'number') return

    lastClientX = clientXPos

    const nextColumnSizing: Record<string, number> = {}
    const deltaPercentage = Math.min(
      Math.max(
        ((clientXPos - dragStartClientX) * directionMultiplier) / startSize,
        minDeltaPercentage
      ),
      maxDeltaPercentage
    )
    const deltaOffset = deltaPercentage * startSize

    columnSizingStart.forEach(([columnId, headerSize]) => {
      nextColumnSizing[columnId] =
        Math.round(Math.max(headerSize + headerSize * deltaPercentage, 0) * 100) / 100
    })

    if (liveTableElement) {
      columnSizingStart.forEach(([columnId]) => {
        const nextSize = nextColumnSizing[columnId]
        if (typeof nextSize !== 'number') return
        liveTableElement.style.setProperty(`--col-${columnId}-size`, String(nextSize))
        liveTableElement.style.setProperty(`--header-${columnId}-size`, String(nextSize))
      })
    } else {
      table.setColumnResizing((old) => ({
        ...old,
        startOffset,
        startSize,
        deltaOffset,
        deltaPercentage,
        columnSizingStart,
        isResizingColumn: column.id
      }))
    }

    if (commit) {
      table.setColumnSizing((old) => ({
        ...old,
        ...nextColumnSizing
      }))
    }
  }

  // Single teardown path: commits at the given position, removes every
  // document/window listener, and restores cursors. Safe to call more than
  // once (blur + mouseup + unmount can race).
  const endResize = (clientXPos?: number) => {
    if (ended) return
    ended = true

    stopListeners.forEach((stop) => stop())
    updateOffset(clientXPos, true)
    table.setColumnResizing((old) => ({
      ...old,
      isResizingColumn: false,
      startOffset: null,
      startSize: null,
      deltaOffset: null,
      deltaPercentage: null,
      columnSizingStart: []
    }))
    ownerDocument.body.style.cursor = previousBodyCursor
    ownerDocument.documentElement.style.cursor = previousDocumentCursor
  }

  const mouseMoveHandler = (moveEvent: globalThis.MouseEvent) => {
    updateOffset(moveEvent.clientX)
  }
  const mouseUpHandler = (upEvent: globalThis.MouseEvent) => {
    endResize(upEvent.clientX)
  }
  const touchMoveHandler = (moveEvent: globalThis.TouchEvent) => {
    if (moveEvent.cancelable) {
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
    }

    updateOffset(getDataGridResizeEventClientX(moveEvent, touchIdentifier))
  }
  const touchEndHandler = (endEvent: globalThis.TouchEvent) => {
    // Ignore other fingers lifting; only the initiating touch ends the drag.
    const clientXPos =
      typeof touchIdentifier === 'number'
        ? findTouchClientX(endEvent.changedTouches, touchIdentifier)
        : getDataGridResizeEventClientX(endEvent)

    if (typeof clientXPos !== 'number') return

    if (endEvent.cancelable) {
      endEvent.preventDefault()
      endEvent.stopPropagation()
    }

    endResize(clientXPos)
  }
  // System-interrupted gestures and window focus loss would otherwise leave
  // the session (and its document listeners) live with no pointer held.
  const touchCancelHandler = () => {
    endResize(lastClientX)
  }
  const windowBlurHandler = () => {
    endResize(lastClientX)
  }

  const passiveIfSupported = { passive: false } as const

  if (isTouchSession) {
    ownerDocument.addEventListener('touchmove', touchMoveHandler, passiveIfSupported)
    ownerDocument.addEventListener('touchend', touchEndHandler, passiveIfSupported)
    ownerDocument.addEventListener('touchcancel', touchCancelHandler)
    stopListeners.push(() => {
      ownerDocument.removeEventListener('touchmove', touchMoveHandler)
      ownerDocument.removeEventListener('touchend', touchEndHandler)
      ownerDocument.removeEventListener('touchcancel', touchCancelHandler)
    })
  } else {
    ownerDocument.addEventListener('mousemove', mouseMoveHandler, passiveIfSupported)
    ownerDocument.addEventListener('mouseup', mouseUpHandler, passiveIfSupported)
    stopListeners.push(() => {
      ownerDocument.removeEventListener('mousemove', mouseMoveHandler)
      ownerDocument.removeEventListener('mouseup', mouseUpHandler)
    })
  }

  if (ownerWindow) {
    ownerWindow.addEventListener('blur', windowBlurHandler)
    stopListeners.push(() => ownerWindow.removeEventListener('blur', windowBlurHandler))
  }

  table.setColumnResizing((old) => ({
    ...old,
    startOffset,
    startSize,
    deltaOffset: 0,
    deltaPercentage: 0,
    columnSizingStart,
    isResizingColumn: column.id
  }))

  return () => endResize(lastClientX)
}

function DataGridTableHead({ children }: { children: ReactNode }) {
  const { props } = useDataGrid()

  return (
    <thead
      {...stylex.props(
        props.tableStyles?.header,
        props.tableLayout?.headerSticky && (props.tableStyles?.headerSticky ?? s.headerSticky)
      )}
    >
      {children}
    </thead>
  )
}

function DataGridTableHeadRow({ children, rowId }: { children: ReactNode; rowId: string }) {
  const { props } = useDataGrid()

  return (
    <tr
      // Not `data-row-id`: the cell logic reads that attribute to find data rows.
      data-header-row-id={rowId}
      aria-rowindex={props.tableLayout?.cellSelection ? 1 : undefined}
      {...stylex.props(props.tableStyles?.headerRow)}
    >
      {children}
    </tr>
  )
}

function DataGridTableHeadRowCell<TData extends object>({
  children,
  header,
  dndRef,
  dndStyle,
  table
}: {
  children: ReactNode
  header: Header<DataGridFeatures, TData>
  dndRef?: Ref<HTMLTableCellElement>
  dndStyle?: StyleXStyles
  table: DataGridTableInstance<TData>
}) {
  const { props, gridId } = useDataGrid()

  const { column } = header
  const isPinned = column.getIsPinned()
  const isFirstStartPinned = isPinned === 'start' && column.getIsFirstColumn('start')
  const isLastStartPinned = isPinned === 'start' && column.getIsLastColumn('start')
  const isFirstEndPinned = isPinned === 'end' && column.getIsFirstColumn('end')
  const isLastEndPinned = isPinned === 'end' && column.getIsLastColumn('end')
  const isLastVisibleColumn =
    column.getIndex() === header.getContext().table.getVisibleLeafColumns().length - 1

  const sortDirection = column.getIsSorted()

  return (
    <th
      ref={dndRef}
      id={getDataGridHeaderDomId(gridId, header.id)}
      scope='col'
      colSpan={header.colSpan > 1 ? header.colSpan : undefined}
      aria-sort={
        sortDirection === 'asc'
          ? 'ascending'
          : sortDirection === 'desc'
            ? 'descending'
            : column.getCanSort()
              ? 'none'
              : undefined
      }
      aria-colindex={props.tableLayout?.cellSelection ? column.getIndex() + 1 : undefined}
      data-col-id={column.id}
      data-dense={props.tableLayout?.dense ? '' : undefined}
      data-pinned={isPinned || undefined}
      data-outer-pinned-col={isFirstStartPinned ? 'start' : isLastEndPinned ? 'end' : undefined}
      data-last-col={isLastStartPinned ? 'start' : isFirstEndPinned ? 'end' : undefined}
      style={{
        // Width geometry stays imperative: resize drags update the CSS
        // variables without React renders.
        ...(props.tableLayout?.width === 'fixed' &&
          !props.tableLayout?.columnsResizable && {
            width: header.getSize()
          }),
        ...(props.tableLayout?.columnsPinnable && column.getCanPin() && getPinningStyles(column)),
        // A sticky child does not ride a sticky ancestor: under a sticky
        // header the pinned cell's own position:sticky (horizontal) opts it
        // out of the thead's vertical stickiness, and the corner scrolls
        // away while its non-positioned siblings stick. Pin both axes on
        // the cell itself.
        ...(props.tableLayout?.headerSticky && isPinned ? { top: 0 } : null),
        ...(props.tableLayout?.columnsResizable && {
          width: `calc(var(--header-${header.id}-size) * 1px)`
        })
      }}
      {...stylex.props(
        s.th,
        props.tableLayout?.headerBackground && s.thHeaderBackground,
        props.tableLayout?.headerBorder && s.thHeaderBorder,
        props.tableLayout?.cellBorder && s.cellBorder,
        // The resize filler column follows the center group, and a border on
        // the last center cell would float against that empty strip.
        props.tableLayout?.cellBorder &&
          props.tableLayout?.columnsResizable &&
          // With end-pinned columns but no pin affordance, the pinned edge
          // draws no separator of its own; keep the border then.
          (props.tableLayout?.columnsPinnable || !hasDataGridTableRightPinnedColumns(table)) &&
          !isPinned &&
          column.getIsLastColumn('center') &&
          s.cellBorderLast,
        props.tableLayout?.columnsResizable && column.getCanResize() && s.thResizable,
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          isLastVisibleColumn &&
          s.thResizableLast,
        props.tableLayout?.columnsPinnable && column.getCanPin() && isPinned && s.thPinned,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          isPinned === 'start' &&
          isLastStartPinned &&
          s.thPinnedDividerStart,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          isPinned === 'end' &&
          isLastEndPinned &&
          s.thPinnedDividerEnd,
        column.columnDef.meta?.headerStyle,
        // Edge detection spans the full visible leaf order; the header's own
        // group only covers one pinning bucket.
        (column.getIndex() === 0 || isLastVisibleColumn) && props.tableStyles?.edgeCell,
        dndStyle
      )}
    >
      {children}
    </th>
  )
}

/**
 * TanStack's own default, restated here on purpose.
 *
 * v8 merged each feature's default table options into `table.options`, so
 * reading `table.options.columnResizeMode` gave you `"onEnd"` even when the
 * consumer never set it. v9 resolves feature defaults internally and leaves
 * the option `undefined` on the instance, so the old `?? table.options...`
 * fallback quietly produced `undefined` - and every grid that had not opted
 * into a mode explicitly lost the onEnd drag session: no cursor lock, no
 * vertical indicator, and an immediate commit instead of a deferred one.
 */
const DATA_GRID_DEFAULT_COLUMN_RESIZE_MODE = 'onEnd' as const

function getDataGridColumnResizeMode(
  layoutMode: 'onChange' | 'onEnd' | undefined,
  tableMode: 'onChange' | 'onEnd' | undefined
) {
  return layoutMode ?? tableMode ?? DATA_GRID_DEFAULT_COLUMN_RESIZE_MODE
}

function DataGridTableHeadRowCellResize<TData extends object>({
  header,
  table
}: {
  header: Header<DataGridFeatures, TData>
  table: DataGridTableInstance<TData>
}) {
  const { labels, props, gridId } = useDataGrid<TData>()
  const { column } = header
  const isPinned = column.getIsPinned()
  const isLastVisibleColumn =
    column.getIndex() === header.getContext().table.getVisibleLeafColumns().length - 1
  const isResizeModeOnEnd =
    getDataGridColumnResizeMode(
      props.tableLayout?.columnsResizeMode,
      table.options.columnResizeMode
    ) === 'onEnd'
  const stopResizeSessionRef = useRef<(() => void) | undefined>(undefined)

  // End a live drag if the handle unmounts mid-resize so document listeners
  // and the app-wide col-resize cursor don't outlive the grid.
  useEffect(() => {
    return () => {
      stopResizeSessionRef.current?.()
      stopResizeSessionRef.current = undefined
    }
  }, [])

  const handleMouseDown = (event: ReactMouseEvent<HTMLElement>) => {
    // Only the primary button starts a resize; guard before preventDefault so
    // right-click still opens the context menu.
    if (event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()

    stopResizeSessionRef.current?.()
    stopResizeSessionRef.current = startDataGridColumnResizeOnEnd(
      event,
      header,
      table,
      !isResizeModeOnEnd
    )
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()

    stopResizeSessionRef.current?.()
    stopResizeSessionRef.current = startDataGridColumnResizeOnEnd(
      event,
      header,
      table,
      !isResizeModeOnEnd
    )
  }

  const isResizing = column.getIsResizing()

  // The separator's value is the header's width in px, over its leaf columns' limits (a group
  // header resizes all its leaves in proportion, as the drag does).
  const leaves = header.getLeafHeaders()
  const size = header.getSize()
  const minSize = leaves.reduce((sum, leaf) => sum + (leaf.column.columnDef.minSize ?? 0), 0)
  const maxSize = leaves.reduce((sum, leaf) => {
    const max = leaf.column.columnDef.maxSize
    return sum + (typeof max === 'number' && max < Number.MAX_SAFE_INTEGER ? max : Infinity)
  }, 0)
  // The drag's own rule: an end-pinned column grows from its start edge, so its keys mirror.
  const mirrored = (table.options.columnResizeDirection === 'rtl') !== (isPinned === 'end')

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter') {
      // The keyboard twin of the double-click: back to the default width.
      event.preventDefault()
      event.stopPropagation()
      column.resetSize()
      return
    }
    const next = nextColumnSize({
      key: event.key,
      shiftKey: event.shiftKey,
      mirrored,
      size,
      min: minSize,
      max: maxSize
    })
    if (next === null) return
    // The grid's own key handling must not also read an arrow as a cell move.
    event.preventDefault()
    event.stopPropagation()
    if (next === size || size <= 0) return
    const ratio = next / size
    table.setColumnSizing((old) => ({
      ...old,
      ...Object.fromEntries(
        leaves.map((leaf) => [leaf.column.id, Math.round(leaf.getSize() * ratio * 100) / 100])
      )
    }))
  }

  return (
    // A span, deliberately: consumers stretch end-aligned header CONTENT
    // with `[&>div]:w-full` on headerClassName, and that compiled child
    // selector (0,1,1) beats the handle's own w-5 (0,1,0) - a div handle
    // then covers the whole cell and swallows the menu click. Hardening
    // w-5 with ! was rejected: the tag change removes the fight instead
    // of escalating it.
    <span
      data-slot='data-grid-table-resize-handle'
      role='separator'
      tabIndex={0}
      aria-orientation='vertical'
      aria-label={labels.resizeColumn(getColumnHeaderLabel(column))}
      aria-controls={getDataGridHeaderDomId(gridId, header.id)}
      aria-valuenow={Math.round(size)}
      aria-valuetext={labels.columnWidth(Math.round(size))}
      aria-valuemin={Math.round(minSize)}
      // A column with no maximum says so with TanStack's own sentinel: ARIA 1.2 reads a missing
      // `aria-valuemax` as 100, which would sit below `aria-valuenow`.
      aria-valuemax={Number.isFinite(maxSize) ? Math.round(maxSize) : Number.MAX_SAFE_INTEGER}
      onKeyDown={handleKeyDown}
      {...{
        onDoubleClick: () => column.resetSize(),
        onMouseDown: handleMouseDown,
        onTouchStart: handleTouchStart
      }}
      {...stylex.props(
        s.resizeHandle,
        s.resizeHandleFocusable,
        isPinned === 'end'
          ? [
              // An end-pinned column grows from its START edge (its end is
              // anchored), so the handle lives there, inside the sticky cell.
              s.resizeHandleStart,
              props.tableLayout?.columnsPinnable
                ? s.resizeHandleLineHidden
                : [s.resizeHandleLine, s.resizeHandleLineStart]
            ]
          : isLastVisibleColumn
            ? [s.resizeHandleEnd, s.resizeHandleLineHidden]
            : isPinned
              ? [
                  // A pinned column is sticky, so the handle sits inside the
                  // cell instead of straddling the boundary, where the next
                  // sticky cell would paint over it.
                  s.resizeHandleEnd,
                  // With the pin affordance on, the pinned edge already draws
                  // its own separator and a resize line would double it. But
                  // pinning is also usable purely as an ordering lock, with no
                  // affordance and no separator -- and there this line is the
                  // only thing marking the edge, so hiding it left a resizable
                  // column showing a resize cursor and no indicator at all.
                  props.tableLayout?.columnsPinnable
                    ? s.resizeHandleLineHidden
                    : [s.resizeHandleLine, s.resizeHandleLineEnd]
                ]
              : [
                  s.resizeHandleCenter,
                  // With cell borders on, the th border-e already marks every
                  // boundary and this always-on line would double it; the wide
                  // hit area and resize cursor stay.
                  props.tableLayout?.cellBorder
                    ? s.resizeHandleLineHidden
                    : [s.resizeHandleLine, s.resizeHandleLineCenter]
                ],
        isResizing && s.resizeHandleActive,
        isResizing &&
          !isResizeModeOnEnd &&
          !isLastVisibleColumn && [
            s.resizeHandleActiveLine,
            ...(isPinned || isLastVisibleColumn
              ? [s.resizeHandleLineEnd, s.resizeHandleActiveLineEnd]
              : [s.resizeHandleLineCenter])
          ]
      )}
    />
  )
}

function DataGridTableResizeIndicator<TData extends object>({
  viewportNodeRef,
  table
}: {
  viewportNodeRef: RefObject<HTMLDivElement | null>
  table: DataGridTableInstance<TData>
}) {
  const { props } = useDataGrid()
  const indicatorRef = useRef<HTMLDivElement | null>(null)
  const indicatorHeadRef = useRef<HTMLDivElement | null>(null)
  // Header height is stable for the duration of a drag; caching it per
  // session avoids a forced layout (querySelector + getBoundingClientRect)
  // on every mousemove.
  const headerHeightCacheRef = useRef<{
    key: string | false
    value: number
  }>({ key: false, value: 0 })
  const columnResizing = table.state.columnResizing
  const resizingColumnId = columnResizing.isResizingColumn
  const resizeMode = getDataGridColumnResizeMode(
    props.tableLayout?.columnsResizeMode,
    table.options.columnResizeMode
  )
  const indicatorActive = !!(
    props.tableLayout?.columnsResizable &&
    resizeMode === 'onEnd' &&
    resizingColumnId
  )

  // Positioning happens imperatively after each drag-frame render: layout
  // reads (viewport rect, thead height) and ref access belong outside render,
  // and writing styles directly avoids holding the viewport node in React
  // state, which would cost every grid a second render pass at mount.
  useLayoutEffect(() => {
    const indicator = indicatorRef.current
    const indicatorHead = indicatorHeadRef.current
    const viewportElement = viewportNodeRef.current

    if (!indicatorActive || !indicator || !indicatorHead || !resizingColumnId) return

    const resizingHeader = table
      .getFlatHeaders()
      .find((header) => header.column.id === resizingColumnId || header.id === resizingColumnId)

    if (!resizingHeader) return

    // deltaOffset is a logical delta (already direction-adjusted); translate
    // by the physical pointer movement so the indicator follows the cursor
    // instead of mirroring it. End-pinned columns resize mirrored (see the
    // session), so the multiplier matches theirs.
    const directionMultiplier =
      (table.options.columnResizeDirection === 'rtl') !==
      (resizingHeader.column.getIsPinned() === 'end')
        ? -1
        : 1
    const deltaOffset = (columnResizing.deltaOffset ?? 0) * directionMultiplier

    if (headerHeightCacheRef.current.key !== resizingColumnId) {
      headerHeightCacheRef.current = {
        key: resizingColumnId,
        value:
          viewportElement
            ?.querySelector('[data-slot="data-grid-table"] thead')
            ?.getBoundingClientRect().height ?? 0
      }
    }

    const headerHeight = headerHeightCacheRef.current.value
    // Anchor on the live header cell: content math (getStart) cannot place a
    // STICKY pinned column, while the DOM rect is right for every column at
    // any scroll position. The state offset and content math stay as
    // fallbacks for a header that is not in the DOM.
    const viewportRoot =
      viewportElement ?? indicator.closest<HTMLElement>('[data-slot="data-grid-table-viewport"]')
    const headerCellElement = viewportRoot?.querySelector<HTMLElement>(
      `thead th[data-col-id="${CSS.escape(resizingHeader.column.id)}"]`
    )
    let indicatorLeft: number
    if (headerCellElement && viewportRoot) {
      const anchorRect = headerCellElement.getBoundingClientRect()
      const edgeClientX =
        (table.options.columnResizeDirection === 'rtl') !==
        (resizingHeader.column.getIsPinned() === 'end')
          ? anchorRect.left
          : anchorRect.right
      indicatorLeft = edgeClientX - viewportRoot.getBoundingClientRect().left
    } else if (typeof columnResizing.startOffset === 'number' && viewportElement) {
      indicatorLeft = columnResizing.startOffset - viewportElement.getBoundingClientRect().left
    } else {
      indicatorLeft = resizingHeader.getStart() + resizingHeader.getSize()
    }

    indicator.style.left = `${indicatorLeft}px`
    indicator.style.transform = `translateX(${deltaOffset}px)`
    indicatorHead.style.height = `${Math.max(headerHeight, 6)}px`
  })

  if (!indicatorActive) return null

  return (
    <div
      ref={indicatorRef}
      aria-hidden='true'
      data-slot='data-grid-table-resize-indicator'
      {...stylex.props(s.resizeIndicator)}
    >
      <div {...stylex.props(s.resizeIndicatorBar)} />
      <div ref={indicatorHeadRef} {...stylex.props(s.resizeIndicatorHead)} style={{ width: 5 }} />
    </div>
  )
}

export {
  DataGridTableHead,
  DataGridTableHeadRow,
  DataGridTableHeadRowCell,
  DataGridTableHeadRowCellResize,
  DataGridTableResizeIndicator
}
