import * as stylex from '@stylexjs/stylex'
import type { StyleXStyles } from '@stylexjs/stylex'
import { Subscribe } from '@tanstack/react-table'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../base/button'
import type { DataGridTableInstance } from './data-grid'
import type { DataGridEditorAdvance, DataGridEditorSession } from './data-grid-cell-ops'
import { dataGridCellEditorStyles, dataGridSelectionBarStyles } from './data-grid.stylex'
import type { DataGridCellEditorMetrics } from './data-grid.stylex'

/**
 * Focuses the in-cell editor and puts the caret at the END of the value (the
 * Excel F2 convention); a textarea would otherwise open with it at position
 * 0. Used as the editor's ref callback, so both happen on mount without the
 * a11y-hostile `autoFocus` attribute.
 */
function focusDataGridCellEditor(element: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!element) return
  element.focus()
  const end = element.value.length
  element.setSelectionRange?.(end, end)
}

/**
 * The built-in free-text editor: a portal into the body viewport, positioned
 * flush over the focused cell with the cell's own font, alignment and
 * padding, so the text keeps its exact place - the Sheets model. The
 * `textarea` control grows downward over the rows below as the text wraps
 * (raw-CSS `field-sizing`, see globals.css).
 */
function measureDataGridCellEditorStyle(viewport: HTMLElement): DataGridCellEditorMetrics | null {
  const cell = viewport.querySelector<HTMLElement>('td[data-cell-focused]')
  if (!cell) return null
  const cellRect = cell.getBoundingClientRect()
  const viewportRect = viewport.getBoundingClientRect()
  const cellStyle = getComputedStyle(cell)
  // The td centers its one line vertically (align-middle); the editor must
  // put the text in exactly the same place or opening it shifts the value.
  // Symmetric block padding sized to center one line does that for the
  // textarea too, and keeps holding as it grows line by line.
  const lineHeight =
    Number.parseFloat(cellStyle.lineHeight) || Number.parseFloat(cellStyle.fontSize) * 1.5 || 20
  const centeredBlockPadding = Math.max(
    Number.parseFloat(cellStyle.paddingTop) || 0,
    (cellRect.height - lineHeight) / 2
  )
  return {
    // Rect deltas are visual; when the viewport itself is the scroll
    // container (the standalone virtual layout), absolute children live in
    // content coordinates, so the scroll offset must be added back. The box
    // matches the cell exactly - editing must not change the cell's
    // geometry - and the cell's own overlay chrome hides for the session
    // (data-cell-editing), so the editor's outline is the ONE border.
    left: cellRect.left - viewportRect.left + viewport.scrollLeft,
    top: cellRect.top - viewportRect.top + viewport.scrollTop,
    width: cellRect.width,
    minHeight: cellRect.height,
    fontFamily: cellStyle.fontFamily,
    fontSize: cellStyle.fontSize,
    fontWeight: cellStyle.fontWeight,
    fontStyle: cellStyle.fontStyle,
    lineHeight: cellStyle.lineHeight,
    letterSpacing: cellStyle.letterSpacing,
    textAlign: cellStyle.textAlign,
    paddingLeft: cellStyle.paddingLeft,
    paddingRight: cellStyle.paddingRight,
    paddingTop: centeredBlockPadding,
    paddingBottom: centeredBlockPadding
  }
}

function DataGridCellEditorOverlay({
  viewport,
  session,
  enterAdvance,
  onCommit,
  onCancel
}: {
  viewport: HTMLElement
  session: DataGridEditorSession
  enterAdvance: boolean
  onCommit: (raw: string, advance: DataGridEditorAdvance, refocus?: boolean) => void
  onCancel: () => void
}) {
  // Measured lazily at first render: the focused td was committed before the
  // session opened, and the overlay remounts per cell via its key, so one
  // measurement holds for the editor's lifetime.
  const [metrics] = useState<DataGridCellEditorMetrics | null>(() =>
    measureDataGridCellEditorStyle(viewport)
  )
  const finishedRef = useRef(false)

  useEffect(() => {
    if (!metrics) onCancel()
  }, [metrics, onCancel])

  // External row changes mid-edit (a live update, a re-sort) move or remove
  // the cell underneath the overlay; the measured position is then a lie and
  // a commit could land visually elsewhere. Cancel instead: predictable, and
  // nothing is written that the user cannot see.
  useEffect(() => {
    const body = viewport.querySelector('tbody')
    if (!body) return undefined
    const observer = new MutationObserver(() => {
      if (!finishedRef.current) onCancel()
    })
    observer.observe(body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [viewport, onCancel])

  if (!metrics) return null

  const editorProps = stylex.props(dataGridCellEditorStyles.editor(metrics))

  const finish = (
    element: HTMLInputElement | HTMLTextAreaElement,
    commit: boolean,
    advance: DataGridEditorAdvance = null,
    refocus = true
  ) => {
    // One finish per session: an Enter commit can be chased by the blur the
    // unmount produces, and a doubled commit would write twice.
    if (finishedRef.current) return
    finishedRef.current = true
    if (commit) onCommit(element.value, advance, refocus)
    else onCancel()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const element = event.currentTarget
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      finish(element, false)
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      finish(element, true, event.shiftKey ? 'left' : 'right')
      return
    }
    if (event.key !== 'Enter') return
    // A textarea keeps Shift/Alt+Enter as a newline, the Sheets convention.
    if (session.control === 'textarea' && (event.shiftKey || event.altKey)) {
      return
    }
    event.preventDefault()
    // The default keeps focus on the edited cell, so a corrected value can
    // be reviewed in place; enterAdvance restores the Sheets move-down.
    finish(element, true, enterAdvance ? (event.shiftKey ? 'up' : 'down') : null)
  }

  return createPortal(
    session.control === 'textarea' ? (
      <textarea
        data-slot='data-grid-cell-editor'
        data-multiline='true'
        ref={focusDataGridCellEditor}
        aria-label={session.label}
        defaultValue={session.initialValue}
        rows={1}
        {...editorProps}
        onKeyDown={handleKeyDown}
        onBlur={(event) => finish(event.currentTarget, true, null, false)}
      />
    ) : (
      <input
        data-slot='data-grid-cell-editor'
        ref={focusDataGridCellEditor}
        aria-label={session.label}
        defaultValue={session.initialValue}
        {...editorProps}
        onKeyDown={handleKeyDown}
        onBlur={(event) => finish(event.currentTarget, true, null, false)}
      />
    ),
    viewport
  )
}

/* ------------------------------------------------------------------------- *
 * Bulk edit bar.
 * ------------------------------------------------------------------------- */

/**
 * Thin shell over row selection for bulk actions: selected count, a slot for
 * the consumer's controls, and a clear action. Hidden while nothing is
 * selected. What the controls do stays consumer-owned.
 */
function DataGridSelectionBar<TData extends object>({
  children,
  style,
  label,
  clearLabel = 'Clear',
  onClear,
  table
}: {
  children?: ReactNode
  style?: StyleXStyles
  label?: (count: number) => ReactNode
  clearLabel?: ReactNode
  onClear?: () => void
  /** The grid's table instance; the row type flows from it. */
  table: DataGridTableInstance<TData>
}) {
  // The Subscribe closure re-runs on atom writes without re-rendering the
  // component, so the table is read through the ref mirror; a captured v9
  // wrapper would keep reporting the state it was built with.
  const tableRef = useRef(table)
  tableRef.current = table
  const rowSelectionAtom = table.atoms.rowSelection
  if (rowSelectionAtom == null) return null

  return (
    <Subscribe source={rowSelectionAtom}>
      {() => {
        const currentTable = tableRef.current
        const count = currentTable.getSelectedRowModel().rows.length
        if (count === 0) return null
        return (
          <div
            data-slot='data-grid-selection-bar'
            {...stylex.props(dataGridSelectionBarStyles.bar, style)}
          >
            <span {...stylex.props(dataGridSelectionBarStyles.label)}>
              {label ? label(count) : `${count} selected`}
            </span>
            <div {...stylex.props(dataGridSelectionBarStyles.actions)}>
              {children}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  tableRef.current.resetRowSelection()
                  onClear?.()
                }}
              >
                {clearLabel}
              </Button>
            </div>
          </div>
        )
      }}
    </Subscribe>
  )
}

export { DataGridCellEditorOverlay, DataGridSelectionBar }
