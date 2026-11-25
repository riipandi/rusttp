/**
 * The one Tab stop of a grid whose rows are clickable (`onRowClick`), the row-focus form of the
 * WAI-ARIA grid pattern: Tab enters the rows at a single stop, the arrows move between rows, and
 * Enter or Space activates the row. Roving tabindex is state shared by every row, so it lives in a
 * store the rows subscribe to one by one: moving the stop re-renders the two rows that change, not
 * all of them.
 *
 * The stop is the row that last took focus while it is still rendered; otherwise it is the first
 * rendered row. A virtualized or paged grid drops rows from the DOM, so the stop falls back
 * instead of leaving the grid with no Tab stop.
 */
interface DataGridRowStops {
  /** Records a rendered clickable row; the returned function removes it. */
  register: (id: string, element: HTMLElement) => () => void
  /** The row that took focus becomes the stop. */
  setActive: (id: string) => void
  /** The id of the row that is the Tab stop now, or null while none is rendered. */
  getStopId: () => string | null
  subscribe: (listener: () => void) => () => void
}

function createDataGridRowStops(): DataGridRowStops {
  const rendered = new Map<string, HTMLElement>()
  const listeners = new Set<() => void>()
  let activeId: string | null = null
  let stopId: string | null = null
  let pending = false

  const recompute = () => {
    let next: string | null = null
    if (activeId !== null && rendered.has(activeId)) {
      next = activeId
    } else {
      let first: HTMLElement | null = null
      for (const [id, element] of rendered) {
        // `first` follows `element` in the document: `element` comes first.
        if (!first || element.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING) {
          first = element
          next = id
        }
      }
    }
    if (next === stopId) return
    stopId = next
    for (const listener of listeners) listener()
  }

  // A grid mounts its rows in one commit; one scan for all of them, not one per row.
  const schedule = () => {
    if (pending) return
    pending = true
    queueMicrotask(() => {
      pending = false
      recompute()
    })
  }

  return {
    register: (id, element) => {
      rendered.set(id, element)
      schedule()
      return () => {
        if (rendered.get(id) === element) rendered.delete(id)
        schedule()
      }
    },
    setActive: (id) => {
      activeId = id
      recompute()
    },
    getStopId: () => stopId,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
  }
}

/** The clickable rows of the table `from` sits in, in document order. */
function getClickableRows(from: HTMLElement): HTMLElement[] {
  return Array.from(
    from.closest('table')?.querySelectorAll<HTMLElement>('tr[data-row-clickable]') ?? []
  )
}

/** Moves focus from a row to its neighbour, or to the first or last rendered row. */
function moveRowFocus(from: HTMLElement, to: 'next' | 'previous' | 'first' | 'last') {
  const rows = getClickableRows(from)
  const index = rows.indexOf(from)
  const target =
    to === 'first'
      ? rows[0]
      : to === 'last'
        ? rows[rows.length - 1]
        : rows[index + (to === 'next' ? 1 : -1)]
  target?.focus()
}

export { createDataGridRowStops, moveRowFocus }
export type { DataGridRowStops }
