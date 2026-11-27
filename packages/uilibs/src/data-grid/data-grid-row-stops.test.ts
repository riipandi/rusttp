import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDataGridRowStops, moveRowFocus } from './data-grid-row-stops'

// Rows live in a real table in the document: "first rendered" is decided by document order.
let host: HTMLElement
const tableOf = (ids: string[]) => {
  host = document.createElement('div')
  host.innerHTML =
    '<table><tbody>' +
    ids.map((id) => `<tr data-row-id="${id}" data-row-clickable tabindex="-1"></tr>`).join('') +
    '</tbody></table>'
  document.body.append(host)
  const rows = new Map(
    Array.from(host.querySelectorAll<HTMLElement>('tr')).map((row) => [row.dataset.rowId!, row])
  )
  return (id: string) => rows.get(id)!
}
// The stop is recomputed once per microtask burst of registrations.
const burst = () => Promise.resolve()

afterEach(() => {
  host.remove()
})

describe('createDataGridRowStops', () => {
  it('makes the first rendered row in document order the stop, whatever the registration order', async () => {
    const row = tableOf(['harry', 'ron', 'hermione'])
    const stops = createDataGridRowStops()
    stops.register('hermione', row('hermione'))
    stops.register('harry', row('harry'))
    stops.register('ron', row('ron'))
    expect(stops.getStopId()).toBeNull()
    await burst()
    expect(stops.getStopId()).toBe('harry')
  })

  it('notifies once for a burst of registrations, and not at all when the stop does not move', async () => {
    const row = tableOf(['harry', 'ron', 'hermione'])
    const stops = createDataGridRowStops()
    const listener = vi.fn()
    stops.subscribe(listener)
    for (const id of ['harry', 'ron', 'hermione']) stops.register(id, row(id))
    await burst()
    expect(listener).toHaveBeenCalledTimes(1)
    // A later row is not before the stop: the scan runs, the stop stays, nobody is told.
    stops.register('ron', row('ron'))
    await burst()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('makes the row that took focus the stop at once', async () => {
    const row = tableOf(['harry', 'ron', 'hermione'])
    const stops = createDataGridRowStops()
    for (const id of ['harry', 'ron', 'hermione']) stops.register(id, row(id))
    await burst()
    const listener = vi.fn()
    stops.subscribe(listener)
    stops.setActive('hermione')
    expect(stops.getStopId()).toBe('hermione')
    expect(listener).toHaveBeenCalledTimes(1)
    stops.setActive('hermione')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('falls back to the first rendered row when the active row unmounts', async () => {
    const row = tableOf(['harry', 'ron', 'hermione'])
    const stops = createDataGridRowStops()
    const unregister = Object.fromEntries(
      ['harry', 'ron', 'hermione'].map((id) => [id, stops.register(id, row(id))])
    )
    stops.setActive('hermione')
    await burst()
    unregister.hermione!()
    await burst()
    expect(stops.getStopId()).toBe('harry')
    // And back: the row mounts again and is still the row that last took focus.
    stops.register('hermione', row('hermione'))
    await burst()
    expect(stops.getStopId()).toBe('hermione')
  })

  it('falls back when the active row was never rendered, and is null with no rows', async () => {
    const row = tableOf(['harry', 'ron'])
    const stops = createDataGridRowStops()
    const unregister = stops.register('ron', row('ron'))
    stops.setActive('draco')
    await burst()
    expect(stops.getStopId()).toBe('ron')
    unregister()
    await burst()
    expect(stops.getStopId()).toBeNull()
  })

  it('keeps a row that registered again when the old registration is removed', async () => {
    const row = tableOf(['harry', 'ron'])
    const stops = createDataGridRowStops()
    const first = stops.register('harry', row('harry'))
    stops.register('harry', row('ron'))
    first()
    await burst()
    expect(stops.getStopId()).toBe('harry')
  })

  it('stops notifying a listener that unsubscribed', async () => {
    const row = tableOf(['harry'])
    const stops = createDataGridRowStops()
    const listener = vi.fn()
    stops.subscribe(listener)()
    stops.register('harry', row('harry'))
    await burst()
    expect(listener).not.toHaveBeenCalled()
  })
})

const focused = () =>
  document.activeElement instanceof HTMLElement ? document.activeElement.dataset.rowId : undefined

describe('moveRowFocus', () => {
  const ids = ['harry', 'ron', 'hermione', 'draco', 'luna', 'neville', 'ginny']

  it('moves to the next and the previous row, and stays put at either end', () => {
    const row = tableOf(ids)
    moveRowFocus(row('ron'), 'next')
    expect(focused()).toBe('hermione')
    moveRowFocus(row('ron'), 'previous')
    expect(focused()).toBe('harry')
    moveRowFocus(row('harry'), 'previous')
    expect(focused()).toBe('harry')
    moveRowFocus(row('ginny'), 'next')
    expect(focused()).toBe('ginny')
  })

  it('jumps to the first and the last rendered row', () => {
    const row = tableOf(ids)
    moveRowFocus(row('luna'), 'last')
    expect(focused()).toBe('ginny')
    moveRowFocus(row('luna'), 'first')
    expect(focused()).toBe('harry')
  })

  it('moves by a page and clamps at both ends', () => {
    const row = tableOf(ids)
    moveRowFocus(row('ron'), 3)
    expect(focused()).toBe('luna')
    moveRowFocus(row('luna'), -3)
    expect(focused()).toBe('ron')
    moveRowFocus(row('luna'), 10)
    expect(focused()).toBe('ginny')
    moveRowFocus(row('luna'), -10)
    expect(focused()).toBe('harry')
  })

  it('only sees the rows of its own table', () => {
    const row = tableOf(['harry', 'ron'])
    const other = document.createElement('table')
    other.innerHTML =
      '<tbody><tr data-row-id="draco" data-row-clickable tabindex="-1"></tr></tbody>'
    host.append(other)
    moveRowFocus(row('ron'), 'last')
    expect(focused()).toBe('ron')
    moveRowFocus(row('harry'), 'next')
    expect(focused()).toBe('ron')
  })
})
