import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useDataGrid } from './data-grid'
import type { DataGridTableInstance } from './data-grid'
import { DataGridCellEditorOverlay } from './data-grid-cell-editor'
import {
  buildDataGridClearDetails,
  buildDataGridPasteDetails,
  extendDataGridSelection,
  getDataGridActiveBound,
  getDataGridActiveRegionGrid,
  getDataGridDisplayOrderedColumns,
  getDataGridStepTarget,
  getDataGridVisibleSelectedCellCount,
  getDataGridWritableCellEdit,
  parseDataGridClipboardText,
  renderDataGridClipboardHtml,
  selectDataGridRegion,
  serializeDataGridClipboardText,
  startDataGridFillSession
} from './data-grid-cell-ops'
import type {
  DataGridCellSelectionApi,
  DataGridEditorAdvance,
  DataGridEditorSession
} from './data-grid-cell-ops'

/* ------------------------------------------------------------------------- *
 * Controller.
 * ------------------------------------------------------------------------- */

function isDataGridEditableTarget(target: EventTarget | null): boolean {
  // data-cell-interactive is the same opt-out the mousedown guard honors, so
  // a custom widget keeps its own keys and clipboard as well as its clicks.
  return (
    target instanceof Element &&
    target.closest('input, textarea, select, [contenteditable], [data-cell-interactive]') != null
  )
}

// Keys belong to a focused in-cell control the same way clicks do: the
// button, link and checkbox set the mousedown guard exempts must keep its
// native Enter, Space and Tab, or an in-cell button is keyboard-dead.
// Clipboard stays on the narrower guard: copying the grid selection while a
// button happens to hold focus is what a spreadsheet user expects.
function isDataGridInteractiveKeyTarget(target: EventTarget | null): boolean {
  return (
    isDataGridEditableTarget(target) ||
    (target instanceof Element && target.closest('button, a, [role="checkbox"]') != null)
  )
}

/** Swallows the click that follows a completed cell-range drag, so the drag's
 * terminating click never toggles or focuses whatever it landed on. */
function squelchRangeDragClick(clickEvent: MouseEvent) {
  clickEvent.stopPropagation()
  clickEvent.preventDefault()
}

/**
 * Headless spreadsheet controller: keyboard navigation, clipboard, clear and
 * the fill-handle drag. Mount once inside `<DataGrid>`, next to the table.
 * Renders only a hidden anchor; the real listeners attach to the grid's own
 * body viewport, which also receives focus (container-focus model), so a
 * virtualized row unmounting can never strand `document.activeElement`.
 */
function DataGridCellSelection<TData extends object>({
  apiRef,
  clipboard = true,
  keyboard = true,
  table
}: {
  /** Receives the controller's imperative API, e.g. for create-row flows. */
  apiRef?: RefObject<DataGridCellSelectionApi | null>
  /** Native copy, cut and paste handling. Defaults to true. */
  clipboard?: boolean
  /**
   * Arrows (with Ctrl/Cmd edge jumps), Home/End, PageUp/PageDown, Enter,
   * F2, type-to-edit, Tab, Ctrl/Cmd+A, Delete, Escape. Defaults to true.
   */
  keyboard?: boolean
  /** The grid's table instance; the row type flows from it. */
  table: DataGridTableInstance<TData>
}) {
  // The context value serves `props` through getters over the provider's own
  // refs; the table arrives as a prop and rides the ref mirror below, so
  // handlers keep reaching the CURRENT instances now that the context no
  // longer carries `table`.
  const context = useDataGrid<TData>()

  const anchorRef = useRef<HTMLSpanElement | null>(null)
  // The body viewport, once the wiring effect resolves it; the built-in
  // editor overlay portals into it so it scrolls with the cells.
  const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)
  const [editorSession, setEditorSession] = useState<DataGridEditorSession | null>(null)
  const enabled = !!context.props.tableLayout?.cellSelection && table.atoms.cellSelection != null

  // The wiring effect reads config through this ref: the context object serves
  // fresh props through its own getter, the table prop rides the mirror, and
  // re-wiring the listeners whenever a callback prop changes identity would
  // tear down an active cell selection mid-drag. Written during render on
  // purpose - the value must be current for every consumer read within the
  // same commit.
  const wiringRef = useRef({ context, table, apiRef })
  useEffect(() => {
    wiringRef.current = { context, table, apiRef }
  })

  useEffect(() => {
    if (!enabled) return undefined
    const anchor = anchorRef.current
    if (!anchor) return undefined

    const root = anchor.closest('[data-slot="data-grid"]') ?? anchor.parentElement
    if (!root) return undefined

    // Split header/body grids render two viewports; the body one owns focus.
    const viewports = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="data-grid-table-viewport"]')
    )
    const viewport =
      viewports.find((node) => node.querySelector('[data-slot="data-grid-table-body"]')) ??
      viewports[0]
    if (!viewport) return undefined

    const { apiRef: apiRefTarget } = wiringRef.current
    const getTable = () => wiringRef.current.table
    // Method-syntax context callbacks read as unbound references, so the
    // getter hands out a bound wrapper instead of the raw method.
    const getOnCellsChange = () => {
      const contextProps = wiringRef.current.context.props
      return contextProps.onCellsChange
        ? (...args: Parameters<typeof contextProps.onCellsChange>) =>
            contextProps.onCellsChange!(...args)
        : null
    }
    // "single" collapses every grow gesture to the focused cell.
    const isRangeSelectionEnabled = () =>
      wiringRef.current.context.props.tableLayout?.cellSelectionMode !== 'single'

    // The focusable element of the container-focus model. The table carries
    // role="grid", so putting DOM focus (and aria-activedescendant) on it is
    // what lets a screen reader follow the focused cell.
    const focusTarget =
      viewport.querySelector<HTMLElement>('table[data-slot="data-grid-table"]') ?? viewport

    const scrollTdIntoView = (cell: Element | null) =>
      // Optional call: jsdom and some embedded contexts ship elements without scrollIntoView.
      cell?.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'instant'
      })

    // Points assistive tech at the virtually focused cell.
    const syncActiveDescendant = () => {
      const cell = viewport.querySelector<HTMLElement>('td[data-cell-focused]')
      if (cell?.id) focusTarget.setAttribute('aria-activedescendant', cell.id)
      else focusTarget.removeAttribute('aria-activedescendant')
    }

    const scrollFocusedIntoView = (
      targetRowIndex?: number,
      rowCount?: number,
      // A Shift-extend grows away from the focused cell, which stays the
      // anchor; the caller names the range's active corner so the view
      // follows the growing edge instead of snapping back to the anchor.
      explicitCell?: { rowId: string; columnId: string }
    ) => {
      const queryScrollCell = () =>
        explicitCell
          ? viewport.querySelector(
              `tr[data-row-id="${CSS.escape(explicitCell.rowId)}"] td[data-col-id="${CSS.escape(explicitCell.columnId)}"]`
            )
          : viewport.querySelector('td[data-cell-focused]')
      // After the atom write React still has to commit the data attributes;
      // rAF lands after that commit. Instant, because the app-level
      // scroll-smooth would otherwise animate every keystroke.
      requestAnimationFrame(() => {
        const cell = queryScrollCell()
        syncActiveDescendant()
        if (cell || targetRowIndex == null || !rowCount) {
          scrollTdIntoView(cell)
          return
        }
        // Virtualization: the jump target is not mounted, so there is no td
        // to scroll to. The spacer rows keep scrollHeight proportional to
        // the row count, so estimate the offset, let the virtualizer mount
        // the region, then finish with a precise nearest-scroll.
        let scroller: HTMLElement | null = viewport
        while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
          scroller = scroller.parentElement
        }
        if (!scroller) return
        scroller.scrollTop =
          ((targetRowIndex + 0.5) / rowCount) * scroller.scrollHeight - scroller.clientHeight / 2
        requestAnimationFrame(() => {
          scrollTdIntoView(queryScrollCell())
          syncActiveDescendant()
        })
      })
    }

    // Opens an editor for the focused writable cell: the grid's own overlay
    // for a column with a built-in `control`, the consumer's via
    // `onCellEditRequest` otherwise, and as a last resort the cell's own
    // interactive content (activated the way a mouse would). Returns false
    // when nothing can open so the caller falls back to plain navigation.
    const requestCellEdit = (initialText?: string): boolean => {
      const tableNow = getTable()
      const cell = tableNow.getFocusedCell()
      if (!cell) return false
      const cellEdit = getDataGridWritableCellEdit<TData>(cell.column, cell.row.original)
      if (cellEdit?.control) {
        const baseline = cellEdit.format
          ? cellEdit.format(cell.getValue(), cell.row.original)
          : String(cell.getValue() ?? '')
        const headerTitle = cell.column.columnDef.meta?.headerTitle
        const header = cell.column.columnDef.header
        setEditorSession({
          rowId: cell.row.id,
          columnId: cell.column.id,
          control: cellEdit.control,
          initialValue: initialText ?? baseline,
          baseline,
          label:
            typeof headerTitle === 'string'
              ? headerTitle
              : typeof header === 'string'
                ? header
                : cell.column.id
        })
        return true
      }
      if (cellEdit && wiringRef.current.context.props.onCellEditRequest) {
        wiringRef.current.context.props.onCellEditRequest({
          rowId: cell.row.id,
          columnId: cell.column.id,
          row: cell.row.original,
          previousValue: cell.getValue(),
          initialText
        })
        return true
      }
      // Generic activation: a custom control rendered in the cell (a
      // select trigger, a combobox input, a button) toggles from the
      // keyboard without any consumer wiring - focus it and click it,
      // the same gesture the mouse performs. The lookup is ORDERED so an
      // incidental button (a chip's remove button before a combobox
      // input) never outranks the cell's primary control.
      // Deliberate activation only (Enter, F2, double-click): typing a
      // printable character must never toggle a control it cannot type
      // into, and there is nowhere to put the character.
      if (initialText !== undefined) return false
      const focusedCell = viewport.querySelector('td[data-cell-focused]')
      const control = focusedCell
        ? [
            '[role="combobox"]',
            'select',
            'input, textarea',
            'button, a, [role="checkbox"], [tabindex]:not([tabindex="-1"])'
          ]
            .map((candidate) => focusedCell.querySelector<HTMLElement>(candidate))
            .find(Boolean)
        : null
      if (!control) return false
      control.focus()
      control.click()
      return true
    }

    // The imperative surface. A consumer that creates a row cannot focus
    // its cell through state alone: setFocusedCell needs the row in the
    // table model, DOM focus needs the focus target, and both race the
    // commit that mounts the row. One bounded timer retry (timers, unlike
    // animation frames, run in background tabs) settles all of it in order.
    let focusRetryTimer: ReturnType<typeof setTimeout> | undefined
    const focusCell: DataGridCellSelectionApi['focusCell'] = (rowId, columnId, options) => {
      // A newer call supersedes any chain still polling for an older row.
      clearTimeout(focusRetryTimer)
      let attempts = 12
      const attempt = () => {
        // The grid can unmount mid-retry; a stale timer must go quiet.
        if (!viewport.isConnected) return
        const cell = viewport.querySelector<HTMLElement>(
          `tr[data-row-id="${CSS.escape(rowId)}"] td[data-col-id="${CSS.escape(columnId)}"]`
        )
        if (!cell) {
          if (attempts-- > 0) focusRetryTimer = setTimeout(attempt, 32)
          return
        }
        getTable().setFocusedCell(rowId, columnId)
        focusTarget.focus()
        // The cell's id is static, so assistive tech can point at it ahead
        // of the data-cell-focused commit the rAF sync waits for.
        if (cell.id) focusTarget.setAttribute('aria-activedescendant', cell.id)
        scrollTdIntoView(cell)
        if (!options?.edit) return
        // The built-in overlay measures td[data-cell-focused], so the edit
        // request waits for that attribute to land.
        let editAttempts = 12
        const attemptEdit = () => {
          if (!cell.isConnected) return
          if (cell.hasAttribute('data-cell-focused')) requestCellEdit()
          else if (editAttempts-- > 0) {
            focusRetryTimer = setTimeout(attemptEdit, 32)
          }
        }
        attemptEdit()
      }
      attempt()
    }
    const clearSelection = () => {
      getTable().resetCellSelection(true)
      requestAnimationFrame(syncActiveDescendant)
    }
    const scrollToCell = (rowId: string, columnId: string) => {
      scrollTdIntoView(
        viewport.querySelector(
          `tr[data-row-id="${CSS.escape(rowId)}"] td[data-col-id="${CSS.escape(columnId)}"]`
        )
      )
    }

    if (apiRefTarget) apiRefTarget.current = { focusCell, clearSelection, scrollToCell }

    // Resolves jump targets (Home, End, Ctrl+Arrows, PageUp/PageDown) in the
    // feature's display-index space and lands them through the range API:
    // plain jumps collapse to the target cell, Shift jumps keep the active
    // range's opposite corner as the anchor, the Excel model.
    const jumpFocus = (
      rowTarget: 'first' | 'last' | 'same' | { delta: number },
      columnTarget: 'first' | 'last' | 'same',
      extend: boolean
    ): boolean => {
      const tableNow = getTable()
      const focused = tableNow.getFocusedCell()
      if (!focused) return false
      const rows = tableNow.getRowsInDisplayOrder()
      const allColumns = getDataGridDisplayOrderedColumns(tableNow)
      const selectable = allColumns.filter(
        (column) => column.columnDef.enableCellSelection !== false
      )
      if (!rows.length || !selectable.length) return false
      const rowIndex = focused.row.getDisplayIndex()
      const targetRowIndex =
        rowTarget === 'first'
          ? 0
          : rowTarget === 'last'
            ? rows.length - 1
            : rowTarget === 'same'
              ? rowIndex
              : Math.min(rows.length - 1, Math.max(0, rowIndex + rowTarget.delta))
      // Pagination renders a window of the display order; walk the target
      // back toward the focus until it lands on a rendered row, so a jump
      // can never focus an off-page row the view cannot show. DOM rows
      // join the set so pinned rows outside the page slice stay reachable.
      let clampedRowIndex = targetRowIndex
      // With the whole display order in the page slice nothing is off-page
      // and the clamp cannot move, so skip building the id set.
      if (tableNow.getRowModel().rows.length !== rows.length) {
        const rendered = new Set<string | null>(
          tableNow.getRowModel().rows.map((row: { id: string }) => row.id)
        )
        for (const rowEl of Array.from(viewport.querySelectorAll('tbody tr[data-row-id]'))) {
          rendered.add(rowEl.getAttribute('data-row-id'))
        }
        const step = clampedRowIndex >= rowIndex ? -1 : 1
        while (
          clampedRowIndex !== rowIndex &&
          rows[clampedRowIndex] &&
          !rendered.has(rows[clampedRowIndex]!.id)
        ) {
          clampedRowIndex += step
        }
      }
      const targetRow = rows[clampedRowIndex]
      const targetColumn =
        columnTarget === 'first'
          ? selectable[0]
          : columnTarget === 'last'
            ? selectable[selectable.length - 1]
            : focused.column
      if (!targetRow || !targetColumn) return false
      if (extend) {
        const bound = getDataGridActiveBound(table)
        const columnIndex = allColumns.findIndex((column) => column.id === focused.column.id)
        let anchorRowId = focused.row.id
        let anchorColumnId = focused.column.id
        if (bound) {
          anchorRowId =
            rows[rowIndex === bound.minRowIndex ? bound.maxRowIndex : bound.minRowIndex]?.id ??
            anchorRowId
          anchorColumnId =
            allColumns[
              columnIndex === bound.minColumnIndex ? bound.maxColumnIndex : bound.minColumnIndex
            ]?.id ?? anchorColumnId
        }
        table.selectCellRange(
          {
            anchorRowId,
            anchorColumnId,
            focusRowId: targetRow.id,
            focusColumnId: targetColumn.id
          },
          { mode: 'replace' }
        )
      } else {
        table.setFocusedCell(targetRow.id, targetColumn.id)
      }
      scrollFocusedIntoView(
        clampedRowIndex,
        rows.length,
        // The extend keeps focus on the anchor; follow the jump target.
        extend ? { rowId: targetRow.id, columnId: targetColumn.id } : undefined
      )
      return true
    }

    // One visual-space focus step with the feature's move as the fallback
    // for unresolvable positions; at an edge the focus stays put.
    const moveFocusVisual = (direction: 'up' | 'down' | 'left' | 'right'): void => {
      const tableNow = getTable()
      const focused = tableNow.getFocusedCell()
      const target = focused
        ? getDataGridStepTarget(
            tableNow,
            viewport,
            { rowId: focused.row.id, columnId: focused.column.id },
            direction
          )
        : null
      if (target === 'edge') return
      if (target) {
        table.setFocusedCell(target.rowId, target.columnId)
        return
      }
      table.moveCellSelection(direction)
    }

    // One viewport's worth of rows for PageUp/PageDown, measured from the
    // live layout; 10 when nothing is measurable (jsdom). Data rows only:
    // the virtual table's spacer rows carry the whole scroll offset as
    // height and would collapse the page size to a single row.
    const getPageJumpSize = (): number => {
      const row = viewport.querySelector('tbody tr[data-row-id]')
      // The nearest ancestor that actually scrolls; in the scroll-area
      // layout the viewport's parent is a full-height content wrapper
      // whose clientHeight would make the page span the whole table.
      let scroller: HTMLElement | null = viewport
      while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
        scroller = scroller.parentElement
      }
      const rowHeight = row?.getBoundingClientRect().height || 0
      const viewHeight = scroller?.clientHeight || viewport.clientHeight
      if (!rowHeight || !viewHeight) return 10
      return Math.max(1, Math.floor(viewHeight / rowHeight) - 1)
    }

    // The rows appended after the data rows: the add-row affordance and a
    // consumer appendRow draft. Positional, because an id-less tr is not
    // enough - expanded-detail rows interleave BETWEEN data rows and the
    // empty-state row stands alone, and neither belongs to this region.
    // Virtual spacer rows are aria-hidden and never match.
    const getAppendedRows = (): HTMLElement[] => {
      const body = viewport.querySelector('tbody')
      const appended: HTMLElement[] = []
      // Backwards from the end, stopping at the first data row: O(appended)
      // instead of an array of every rendered row per keystroke.
      let rowEl = body?.lastElementChild
      while (rowEl && !rowEl.hasAttribute('data-row-id')) {
        if (rowEl instanceof HTMLElement && !rowEl.hasAttribute('aria-hidden')) {
          appended.unshift(rowEl)
        }
        rowEl = rowEl.previousElementSibling
      }
      return appended
    }

    const focusFirstIn = (row: HTMLElement | undefined): boolean => {
      const focusable = row?.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable) return false
      focusable.focus()
      // A control that refuses focus (hidden, inert) must not report
      // success, or the arrow key that called this dead-ends.
      return row!.ownerDocument.activeElement === focusable
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return

      // Unified keyboard for the appended region: ArrowDown/ArrowUp walk
      // between its rows, and ArrowUp from its first row returns to the
      // grid's cell navigation. Every other key stays native there.
      const appendedRow =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('tbody > tr:not([data-row-id])')
          : null
      if (appendedRow && viewport.contains(appendedRow)) {
        const appended = getAppendedRows()
        const index = appended.indexOf(appendedRow)
        // An id-less row that is NOT appended (expanded detail content,
        // the empty-state row) keeps every key native.
        if (index === -1) return
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
        if (event.key === 'ArrowDown') {
          if (focusFirstIn(appended[index + 1])) event.preventDefault()
          return
        }
        if (index > 0 && focusFirstIn(appended[index - 1])) {
          event.preventDefault()
          return
        }
        // Back into the grid, on whatever cell was focused last.
        focusTarget.focus()
        syncActiveDescendant()
        event.preventDefault()
        return
      }

      if (isDataGridInteractiveKeyTarget(event.target)) {
        // The ARIA grid pattern's exit gesture: Escape on an in-cell
        // control hands DOM focus back to the grid so navigation resumes.
        // A control that consumed the key first (closing its own popup)
        // never lets it reach here unprevented, and portal-rendered
        // popups keep their Escape entirely outside the viewport.
        if (event.key === 'Escape') {
          const cell =
            event.target instanceof Element ? event.target.closest('td[data-col-id]') : null
          if (cell && viewport.contains(cell)) {
            event.preventDefault()
            event.stopPropagation()
            focusTarget.focus()
            syncActiveDescendant()
          }
        }
        return
      }
      const tableNow = getTable()
      const rtl = getComputedStyle(viewport).direction === 'rtl'
      const horizontal = (direction: 'left' | 'right') =>
        rtl ? (direction === 'left' ? 'right' : 'left') : direction

      // Ahead of the switch so plain letters still reach the type-to-edit
      // fall-through below. Matched by code as well as key, so non-Latin
      // layouts (where the key is the layout's own character) still work.
      if (
        (event.key === 'a' || event.key === 'A' || event.code === 'KeyA') &&
        (event.metaKey || event.ctrlKey) &&
        // AltGr arrives as Ctrl+Alt; that chord types a character on
        // central-European layouts and is not a select-all.
        !event.altKey
      ) {
        if (isRangeSelectionEnabled()) {
          tableNow.selectAllCells()
          // Select-all moves the feature's focus to the range corner,
          // which can sit off-page; keep assistive tech pointed right.
          requestAnimationFrame(syncActiveDescendant)
        }
        event.preventDefault()
        return
      }

      // Explicit copy and cut chords; see writeSelectionToClipboard for
      // why the native copy event cannot carry these. Paste stays on the
      // native event, which browsers do fire at the focused element.
      if ((event.metaKey || event.ctrlKey) && !event.altKey && clipboard) {
        const isCopy = event.key === 'c' || event.key === 'C' || event.code === 'KeyC'
        const isCut = event.key === 'x' || event.key === 'X' || event.code === 'KeyX'
        if (isCopy || isCut) {
          event.preventDefault()
          void writeSelectionToClipboard().then((written) => {
            if (!written) return
            wiringRef.current.context.props.onCellsCopy?.({ ...written, cut: isCut })
            if (!isCut) return
            const onCellsChange = getOnCellsChange()
            if (!onCellsChange) return
            const details = buildDataGridClearDetails<TData>(getTable(), 'cut', true, viewport)
            if (details) onCellsChange(details)
          })
          return
        }
      }

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          const direction =
            event.key === 'ArrowUp'
              ? ('up' as const)
              : event.key === 'ArrowDown'
                ? ('down' as const)
                : horizontal(event.key === 'ArrowLeft' ? 'left' : 'right')
          if (event.metaKey || event.ctrlKey) {
            // Ctrl/Cmd+Arrow jumps to the grid edge in that direction.
            const jumped =
              direction === 'up'
                ? jumpFocus('first', 'same', event.shiftKey && isRangeSelectionEnabled())
                : direction === 'down'
                  ? jumpFocus('last', 'same', event.shiftKey && isRangeSelectionEnabled())
                  : jumpFocus(
                      'same',
                      direction === 'left' ? 'first' : 'last',
                      event.shiftKey && isRangeSelectionEnabled()
                    )
            if (jumped) event.preventDefault()
            return
          }
          // ArrowDown on the last rendered row steps into the appended
          // region (a draft row, or the add-row affordance), keeping one
          // keyboard model across the whole table.
          if (direction === 'down' && !event.shiftKey) {
            const focused = table.getFocusedCell()
            const renderedRows = viewport.querySelectorAll('tbody tr[data-row-id]')
            const lastRenderedId =
              renderedRows[renderedRows.length - 1]?.getAttribute('data-row-id')
            if (
              focused &&
              lastRenderedId &&
              focused.row.id === lastRenderedId &&
              focusFirstIn(getAppendedRows()[0])
            ) {
              event.preventDefault()
              return
            }
          }
          if (event.shiftKey && isRangeSelectionEnabled()) {
            const corner = extendDataGridSelection(table, viewport, direction)
            event.preventDefault()
            scrollFocusedIntoView(undefined, undefined, corner ?? undefined)
            return
          }
          // Plain arrows step in visual space so navigation crosses
          // pinned rows and pagination windows the feature's own move
          // cannot resolve; at a visual edge the focus stays put.
          const focused = table.getFocusedCell()
          const target = focused
            ? getDataGridStepTarget(
                table,
                viewport,
                { rowId: focused.row.id, columnId: focused.column.id },
                direction
              )
            : null
          if (target === 'edge') {
            event.preventDefault()
            return
          }
          if (target) {
            table.setFocusedCell(target.rowId, target.columnId)
            event.preventDefault()
            scrollFocusedIntoView()
            return
          }
          table.moveCellSelection(direction)
          event.preventDefault()
          scrollFocusedIntoView()
          return
        }
        case 'Home':
        case 'End': {
          // Home/End: row start or end; with Ctrl/Cmd, the grid's corners.
          const edge = event.key === 'Home' ? ('first' as const) : ('last' as const)
          const jumped =
            event.metaKey || event.ctrlKey
              ? jumpFocus(edge, edge, event.shiftKey && isRangeSelectionEnabled())
              : jumpFocus('same', edge, event.shiftKey && isRangeSelectionEnabled())
          if (jumped) event.preventDefault()
          return
        }
        case 'PageUp':
        case 'PageDown': {
          const delta = (event.key === 'PageUp' ? -1 : 1) * getPageJumpSize()
          if (jumpFocus({ delta }, 'same', event.shiftKey && isRangeSelectionEnabled())) {
            event.preventDefault()
          }
          return
        }
        case 'Enter': {
          // The Notion/Airtable flow: Enter opens the editor when one is
          // wired; the Excel move-down stays the fallback.
          if (!event.shiftKey && requestCellEdit()) {
            event.preventDefault()
            return
          }
          moveFocusVisual(event.shiftKey ? 'up' : 'down')
          event.preventDefault()
          scrollFocusedIntoView()
          return
        }
        case 'F2': {
          if (requestCellEdit()) event.preventDefault()
          return
        }
        case 'Tab': {
          const before = table.getFocusedCell()
          // Logical directions, no RTL swap: Tab means "next cell" in both
          // reading directions, exactly like DOM tab order.
          moveFocusVisual(event.shiftKey ? 'left' : 'right')
          const after = table.getFocusedCell()
          // Trap Tab only while it moved; at the edges focus leaves the grid,
          // which keyboard users need to escape it at all.
          if (after && after.id !== before?.id) {
            event.preventDefault()
            scrollFocusedIntoView()
          }
          return
        }
        case 'Delete':
        case 'Backspace': {
          const onCellsChange = getOnCellsChange()
          if (!onCellsChange) return
          const details = buildDataGridClearDetails<TData>(table, 'clear', false, viewport)
          if (details) onCellsChange(details)
          event.preventDefault()
          return
        }
        case 'Escape': {
          // Consume the key only while it has a selection to clear, so a
          // grid inside a dialog still lets Escape close the dialog.
          if (table.getCellSelectionBounds().length) {
            table.resetCellSelection(true)
            // The focused-cell attribute is gone after the commit;
            // aria-activedescendant must not keep naming it.
            requestAnimationFrame(syncActiveDescendant)
            event.preventDefault()
            event.stopPropagation()
          }
          return
        }
      }

      // Space on a cell whose content is a checkbox toggles it, the
      // row-select idiom, so the selection column works by keyboard too.
      if (event.key === ' ') {
        const checkbox = viewport
          .querySelector('td[data-cell-focused]')
          ?.querySelector<HTMLElement>('[role="checkbox"], input[type="checkbox"]')
        if (checkbox) {
          checkbox.click()
          event.preventDefault()
          return
        }
      }

      // Type-to-edit: a printable character on the focused cell opens the
      // editor seeded with it, replacing the value the way Notion and
      // Airtable do. Plain Ctrl/Cmd chords stay shortcuts, but Ctrl+Alt is
      // AltGr and bare Alt is the macOS Option layer - both type characters.
      if (
        event.key.length === 1 &&
        !event.metaKey &&
        !(event.ctrlKey && !event.altKey) &&
        requestCellEdit(event.key)
      ) {
        event.preventDefault()
        return
      }

      // Space that opened nothing (read-only cell) must not scroll the page
      // out from under the focused cell.
      if (event.key === ' ' && table.getFocusedCell()) {
        event.preventDefault()
      }
    }

    // Writes the active region to the system clipboard in both flavors.
    // Needed because a native copy event only fires for a text selection
    // or an editable target, and a focused grid is neither - Cmd/Ctrl+C
    // would silently do nothing on macOS, Windows and Linux alike. The
    // async API needs a secure context; the execCommand fallback covers
    // the rest with the TSV flavor alone.
    const writeSelectionToClipboard = async (): Promise<{
      text: string
      grid: string[][]
    } | null> => {
      const grid = getDataGridActiveRegionGrid(getTable(), viewport)
      if (!grid) return null
      const text = serializeDataGridClipboardText(grid)
      try {
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': new Blob([text], { type: 'text/plain' }),
              'text/html': new Blob([renderDataGridClipboardHtml(grid)], {
                type: 'text/html'
              })
            })
          ])
          return { text, grid }
        }
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          return { text, grid }
        }
      } catch {
        // Denied or unavailable; the legacy path below still applies.
      }
      const doc = viewport.ownerDocument
      const scratch = doc.createElement('textarea')
      scratch.value = text
      scratch.style.position = 'fixed'
      scratch.style.opacity = '0'
      doc.body.appendChild(scratch)
      scratch.select()
      let copied = false
      try {
        copied = doc.execCommand('copy')
      } catch {
        copied = false
      }
      scratch.remove()
      focusTarget.focus()
      return copied ? { text, grid } : null
    }

    const copySelection = (event: ClipboardEvent, cut: boolean): boolean => {
      const grid = getDataGridActiveRegionGrid(getTable(), viewport)
      if (!grid || !event.clipboardData) return false
      event.preventDefault()
      const text = serializeDataGridClipboardText(grid)
      event.clipboardData.setData('text/plain', text)
      event.clipboardData.setData('text/html', renderDataGridClipboardHtml(grid))
      wiringRef.current.context.props.onCellsCopy?.({ text, grid, cut })
      return true
    }

    const handleCopy = (event: ClipboardEvent) => {
      if (isDataGridEditableTarget(event.target)) return
      copySelection(event, false)
    }

    const handleCut = (event: ClipboardEvent) => {
      if (isDataGridEditableTarget(event.target)) return
      if (!copySelection(event, true)) return
      const onCellsChange = getOnCellsChange()
      if (!onCellsChange) return
      const details = buildDataGridClearDetails<TData>(getTable(), 'cut', true, viewport)
      if (details) onCellsChange(details)
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (isDataGridEditableTarget(event.target)) return
      const onCellsChange = getOnCellsChange()
      if (!onCellsChange) return
      const text = event.clipboardData?.getData('text/plain')
      if (!text) return
      event.preventDefault()
      const tableNow = getTable()
      const result = buildDataGridPasteDetails<TData>(
        tableNow,
        parseDataGridClipboardText(text),
        viewport
      )
      if (!result) return
      onCellsChange(result.details)
      // The pasted region becomes the selection, the documented contract;
      // single mode keeps just the focused cell instead.
      if (isRangeSelectionEnabled()) {
        selectDataGridRegion(tableNow, result.target)
      }
    }

    // Custom-control cells follow the same two-step gesture as editor
    // cells: the first click on an UNFOCUSED cell only focuses it, the
    // second activates the control, so moving the focus around can never
    // fire actions. Radix triggers open on pointerdown and Base UI ones
    // on click, so the press is intercepted at both; checkboxes keep
    // their one-click toggle (the row-select idiom), data-cell-interactive
    // widgets own all their gestures, and single-click edit mode skips
    // the interception outright.
    let pressedUnfocusedControl = false
    const getTwoStepControl = (target: EventTarget | null): Element | null => {
      if (!(target instanceof Element)) return null
      if (target.closest('[data-cell-interactive]')) return null
      if (target.closest('[role="checkbox"], input[type="checkbox"]')) {
        return null
      }
      // Opt-in for widgets whose ACTIVE surface is bigger than any generic
      // selector can know - a combobox whose whole blank chips strip opens
      // it, a canvas editor. Marking the wrapper data-cell-control makes a
      // press anywhere on it two-step, exactly like a bare button.
      const marked = target.closest('[data-cell-control]')
      if (marked) return marked
      return target.closest(
        'button, a, select, input, textarea, [contenteditable], [role="combobox"]'
      )
    }
    const handleControlPointerDown = (event: PointerEvent) => {
      pressedUnfocusedControl = false
      if (event.button !== 0) return
      if (event.shiftKey || event.ctrlKey || event.metaKey) return
      if (wiringRef.current.context.props.tableLayout?.cellEditMode === 'click') return
      const control = getTwoStepControl(event.target)
      const cell = control?.closest('td[data-col-id]')
      if (!control || !cell || !viewport.contains(cell)) return
      if (cell.hasAttribute('data-cell-focused')) return
      const column = getTable().getColumn(cell.getAttribute('data-col-id') ?? '')
      if (!column || column.columnDef.enableCellSelection === false) return
      pressedUnfocusedControl = true
      // Stops a Radix trigger's pointerdown open before React's root
      // delegation sees it; the mouse events that focus the cell ride on.
      event.stopPropagation()
    }
    const handleControlClick = (event: MouseEvent) => {
      if (!pressedUnfocusedControl) return
      pressedUnfocusedControl = false
      // Swallows the activation click a Base UI trigger listens for.
      event.preventDefault()
      event.stopPropagation()
    }
    const handleControlMouseDown = (event: MouseEvent) => {
      if (!pressedUnfocusedControl) return
      // A Base UI trigger opens on the React-delegated mousedown, and all
      // root-delegated handlers die together when the event stops here -
      // including the td's own focus logic, so the selection start runs
      // imperatively: same feature handler, same drag session.
      event.stopPropagation()
      event.preventDefault()
      const cell = event.target instanceof Element ? event.target.closest('td[data-col-id]') : null
      const rowId = cell?.closest('tr[data-row-id]')?.getAttribute('data-row-id')
      const columnId = cell?.getAttribute('data-col-id')
      if (!rowId || !columnId) return
      const tableNow = getTable()
      const cellApi = tableNow
        .getRowsInDisplayOrder()
        .find((row) => row.id === rowId)
        ?.getAllCellsByColumnId()[columnId]
      if (!cellApi) return
      if (isRangeSelectionEnabled()) {
        cellApi.getSelectionStartHandler()(event)
      } else {
        tableNow.setFocusedCell(rowId, columnId)
      }
      focusTarget.focus()
      requestAnimationFrame(syncActiveDescendant)
    }

    // Drag-to-select outranks in-cell controls: when a drag grew the
    // range, the click that fires on release is swallowed in capture so a
    // trigger under the pointer never opens. The selection key comparison
    // is what distinguishes a drag from a motionless click made while a
    // multi-cell selection already exists (a press on "+ Add row" or an
    // in-cell control changes nothing, and its click must go through).
    let dragStartedOnCell = false
    let dragStartSelectionKey = ''
    const getSelectionKey = () => {
      const tableNow = getTable()
      const bounds = tableNow.getCellSelectionBounds()
      const bound = bounds[bounds.length - 1]
      return `${tableNow.getSelectedCellCount()}:${bounds.length}:${
        bound
          ? `${bound.minRowIndex},${bound.minColumnIndex},${bound.maxRowIndex},${bound.maxColumnIndex}`
          : ''
      }`
    }
    const handleDragMouseUp = () => {
      const wasDrag =
        dragStartedOnCell &&
        getTable().getSelectedCellCount() > 1 &&
        getSelectionKey() !== dragStartSelectionKey
      dragStartedOnCell = false
      viewport.removeAttribute('data-cell-selecting')
      if (!wasDrag) return
      viewport.addEventListener('click', squelchRangeDragClick, { capture: true })
      setTimeout(() => viewport.removeEventListener('click', squelchRangeDragClick, true), 0)
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return
      // The cell a click focuses reaches assistive tech once React commits.
      requestAnimationFrame(syncActiveDescendant)
      const target = event.target instanceof Element ? event.target : null
      // A modifier press is a selection gesture all the way through, the
      // Sheets contract: extending must not hand the keyboard to whatever
      // control sits under the pointer, or the follow-up Shift+arrows land
      // in a date button or a combobox input instead of growing the range.
      // The extension itself runs through the cell's own React handlers, so
      // the event must NOT be defaultPrevented - the delegated handlers
      // treat that as consumed and the extension never happens. Only the
      // browser's focus default is unwanted; it runs after the listeners,
      // so the grid reclaims focus one task later.
      if (
        (event.shiftKey || event.metaKey || event.ctrlKey) &&
        isRangeSelectionEnabled() &&
        target?.closest?.('td[data-col-id]')
      ) {
        setTimeout(() => focusTarget.focus(), 0)
      }
      // Any td press can become a drag; the squelch only arms when the
      // range actually grew by release time. The attribute hides the fill
      // handle for the session, so its overhang never sits in the drag
      // path or churns from cell to cell while the range grows.
      dragStartedOnCell = !!target?.closest?.('td')
      if (dragStartedOnCell) {
        dragStartSelectionKey = getSelectionKey()
        viewport.setAttribute('data-cell-selecting', '')
      }
      if (!target?.closest?.('[data-slot="data-grid-cell-fill-handle"]')) return
      // Ahead of React's root delegation, so the td underneath never starts a
      // plain range drag from the handle.
      event.preventDefault()
      event.stopPropagation()
      startDataGridFillSession<TData>({
        table: getTable(),
        viewport,
        onCellsChange: getOnCellsChange()
      })
    }

    // Single-click editing, the opt-in mode: a plain click that landed
    // on the (now) focused cell opens its editor immediately. Drags were
    // squelched in capture before this bubble listener, and modifier
    // clicks are selection gestures.
    const handleClickToEdit = (event: MouseEvent) => {
      if (wiringRef.current.context.props.tableLayout?.cellEditMode !== 'click') return
      if (event.shiftKey || event.ctrlKey || event.metaKey) return
      if (isDataGridInteractiveKeyTarget(event.target)) return
      const cell = event.target instanceof Element ? event.target.closest('td') : null
      if (!cell?.hasAttribute('data-cell-focused')) return
      requestCellEdit()
    }

    // Double-click opens the editor on the cell the first click focused,
    // matching Sheets. Interactive content keeps its own double-clicks, and
    // the clicked cell must BE the focused one, or a double-click on a
    // non-selectable cell would edit whichever cell held focus before.
    const handleDoubleClick = (event: MouseEvent) => {
      if (isDataGridInteractiveKeyTarget(event.target)) return
      const cell = event.target instanceof Element ? event.target.closest('td') : null
      if (!cell?.hasAttribute('data-cell-focused')) return
      requestCellEdit()
    }

    const previousTabIndex = focusTarget.getAttribute('tabindex')
    const previousOutline = focusTarget.style.outline
    if (keyboard) {
      focusTarget.tabIndex = 0
      // The focused CELL ring is the indicator; the browser's outline around
      // the whole grid on focus() would double it.
      focusTarget.style.outline = 'none'
      viewport.addEventListener('keydown', handleKeyDown)
    }
    if (clipboard) {
      viewport.addEventListener('copy', handleCopy)
      viewport.addEventListener('cut', handleCut)
      viewport.addEventListener('paste', handlePaste)
    }
    viewport.addEventListener('pointerdown', handleControlPointerDown)
    viewport.addEventListener('mousedown', handleControlMouseDown)
    viewport.addEventListener('click', handleControlClick)
    viewport.addEventListener('mousedown', handleMouseDown)
    viewport.addEventListener('click', handleClickToEdit)
    viewport.addEventListener('dblclick', handleDoubleClick)
    viewport.ownerDocument.addEventListener('mouseup', handleDragMouseUp)
    // Selection-change notifications, read through the context getter so
    // the latest callback fires without re-running this effect. The
    // snapshot is only built when a callback is actually wired.
    const toBound = (bound: {
      minRowIndex: number
      maxRowIndex: number
      minColumnIndex: number
      maxColumnIndex: number
    }) => ({
      minRowIndex: bound.minRowIndex,
      maxRowIndex: bound.maxRowIndex,
      minColumnIndex: bound.minColumnIndex,
      maxColumnIndex: bound.maxColumnIndex
    })
    const selectionSubscription = table.atoms.cellSelection?.subscribe(() => {
      const onCellSelectionChange = wiringRef.current.context.props.onCellSelectionChange
      if (!onCellSelectionChange) return
      const tableNow = getTable()
      const focusedCell = tableNow.getFocusedCell()
      const activeBound = getDataGridActiveBound(tableNow)
      onCellSelectionChange({
        focused: focusedCell
          ? { rowId: focusedCell.row.id, columnId: focusedCell.column.id }
          : null,
        bounds: tableNow.getCellSelectionBounds().map(toBound),
        activeBound: activeBound ? toBound(activeBound) : null,
        visibleCellCount: getDataGridVisibleSelectedCellCount(tableNow, viewport)
      })
    })
    setViewportEl(viewport)

    return () => {
      if (keyboard) {
        if (previousTabIndex === null) focusTarget.removeAttribute('tabindex')
        else focusTarget.setAttribute('tabindex', previousTabIndex)
        focusTarget.style.outline = previousOutline
        focusTarget.removeAttribute('aria-activedescendant')
        viewport.removeEventListener('keydown', handleKeyDown)
      }
      if (clipboard) {
        viewport.removeEventListener('copy', handleCopy)
        viewport.removeEventListener('cut', handleCut)
        viewport.removeEventListener('paste', handlePaste)
      }
      viewport.removeEventListener('pointerdown', handleControlPointerDown)
      viewport.removeEventListener('mousedown', handleControlMouseDown)
      viewport.removeEventListener('click', handleControlClick)
      viewport.removeEventListener('mousedown', handleMouseDown)
      viewport.removeEventListener('click', handleClickToEdit)
      viewport.removeEventListener('dblclick', handleDoubleClick)
      viewport.ownerDocument.removeEventListener('mouseup', handleDragMouseUp)
      viewport.removeAttribute('data-cell-selecting')
      selectionSubscription?.unsubscribe()
      clearTimeout(focusRetryTimer)
      if (apiRefTarget) apiRefTarget.current = null
      setViewportEl(null)
      setEditorSession(null)
    }
    // The ref mirror serves the fresh table and the context getter serves
    // fresh props inside every handler, so the effect re-runs only when the
    // table itself is replaced. apiRef (via wiringRef) is only
    // read and written here: keeping it out of the deps means an inline ref
    // object cannot tear the listeners down every render.
  }, [enabled, keyboard, clipboard, table.atoms.cellSelection])

  // The editor overlay covers the cell but not the fill handle's
  // straddling half, which would poke out beneath it; the viewport flags
  // the session so the handle hides, as it does during a drag.
  useEffect(() => {
    if (!viewportEl || !editorSession) return undefined
    viewportEl.setAttribute('data-cell-editing', '')
    return () => viewportEl.removeAttribute('data-cell-editing')
  }, [viewportEl, editorSession])

  // Closing an editor the user finished with keys hands focus back to the
  // viewport so navigation continues where the edit left off; a commit can
  // advance first (Tab across, and Enter down or up when
  // cellEditEnterAdvance opts into the Sheets flow). A blur-initiated close
  // must NOT refocus: the browser already moved focus where the user
  // clicked, and yanking it back would reroute their next keystrokes into
  // the grid.
  const closeEditorSession = (advance: DataGridEditorAdvance, refocus = true) => {
    setEditorSession(null)
    if (advance) {
      // Same visual-space step as keyboard navigation, so a commit on a
      // pinned row advances like any other row.
      const tableNow = wiringRef.current.table
      const focused = tableNow.getFocusedCell()
      const target =
        focused && viewportEl
          ? getDataGridStepTarget(
              tableNow,
              viewportEl,
              { rowId: focused.row.id, columnId: focused.column.id },
              advance
            )
          : null
      if (target && target !== 'edge') {
        tableNow.setFocusedCell(target.rowId, target.columnId)
      } else if (!target) {
        tableNow.moveCellSelection(advance)
      }
    }
    if (!refocus) return
    requestAnimationFrame(() => {
      const focusEl =
        viewportEl?.querySelector<HTMLElement>('table[data-slot="data-grid-table"]') ?? viewportEl
      focusEl?.focus()
      const cell = viewportEl?.querySelector<HTMLElement>('td[data-cell-focused]')
      if (cell?.id) focusEl?.setAttribute('aria-activedescendant', cell.id)
      cell?.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'instant'
      })
    })
  }

  // An unchanged commit dispatches nothing, the Excel model; a parse
  // rejection reports through the batch's rejected list instead of writing.
  const commitEditorSession = (raw: string, advance: DataGridEditorAdvance, refocus = true) => {
    const session = editorSession
    closeEditorSession(advance, refocus)
    const onCellsChange = context.props.onCellsChange?.bind(context.props)
    if (!session || !onCellsChange || raw === session.baseline) return
    const tableNow = wiringRef.current.table
    const row = tableNow.getRowsInDisplayOrder().find((candidate) => candidate.id === session.rowId)
    const column = tableNow.getColumn(session.columnId)
    const cellEdit = column && row ? getDataGridWritableCellEdit<TData>(column, row.original) : null
    if (!row || !column || !cellEdit) return
    const previousValue = row.getAllCellsByColumnId()[column.id]?.getValue()
    let value: unknown = raw
    if (cellEdit.parse) {
      const parsed = cellEdit.parse(raw, row.original)
      if (parsed === undefined) {
        onCellsChange({
          source: 'edit',
          changes: [],
          rejected: [
            {
              rowId: session.rowId,
              columnId: session.columnId,
              raw,
              reason: 'invalid'
            }
          ]
        })
        return
      }
      value = parsed
    }
    onCellsChange({
      source: 'edit',
      changes: [
        {
          rowId: session.rowId,
          columnId: session.columnId,
          row: row.original,
          previousValue,
          value
        }
      ],
      rejected: []
    })
  }

  return (
    <>
      <span ref={anchorRef} hidden data-slot='data-grid-cell-selection' />
      {enabled && viewportEl && editorSession ? (
        <DataGridCellEditorOverlay
          key={`${editorSession.rowId}:${editorSession.columnId}`}
          viewport={viewportEl}
          session={editorSession}
          enterAdvance={context.props.tableLayout?.cellEditEnterAdvance === true}
          onCommit={commitEditorSession}
          onCancel={() => closeEditorSession(null)}
        />
      ) : null}
    </>
  )
}

export { DataGridCellSelection }
