import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// The store reads `localStorage` once, when its module loads, and Vitest's browser mode cannot
// reset modules; a query string makes the browser load a fresh copy, as a new visit would.
let visit = 0
async function freshStore() {
  const path = `./sidebar.store.ts?visit=${++visit}`
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the same module, loaded under another URL
  return (await import(/* @vite-ignore */ path)) as typeof import('./sidebar.store')
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('what a visit starts with', () => {
  test.each([
    ['collapsed', true],
    ['expanded', false],
    ['wide', false],
    ['', false]
  ])('the stored value %j reads collapsed = %s', async (stored, collapsed) => {
    localStorage.setItem('admin-sidebar', stored)
    const { sidebarCollapsed } = await freshStore()
    expect(sidebarCollapsed.get()).toBe(collapsed)
  })

  test('no stored value is expanded', async () => {
    const { sidebarCollapsed } = await freshStore()
    expect(sidebarCollapsed.get()).toBe(false)
  })

  test('a storage that throws on read is expanded', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { sidebarCollapsed } = await freshStore()
    expect(sidebarCollapsed.get()).toBe(false)
  })
})

describe('the user choice', () => {
  test('setCollapsed writes the choice and shows it', async () => {
    const { sidebarStore, sidebarCollapsed } = await freshStore()

    sidebarStore.actions.setCollapsed(true)
    expect(localStorage.getItem('admin-sidebar')).toBe('collapsed')
    expect(sidebarCollapsed.get()).toBe(true)

    sidebarStore.actions.setCollapsed(false)
    expect(localStorage.getItem('admin-sidebar')).toBe('expanded')
    expect(sidebarCollapsed.get()).toBe(false)
  })

  test('setting the choice already made writes nothing and keeps the state', async () => {
    const { sidebarStore } = await freshStore()
    localStorage.setItem('admin-sidebar', 'untouched')
    const before = sidebarStore.get()

    sidebarStore.actions.setCollapsed(false)

    expect(localStorage.getItem('admin-sidebar')).toBe('untouched')
    expect(sidebarStore.get()).toBe(before)
  })

  test('a failed write still changes the sidebar for the session', async () => {
    const { sidebarStore, sidebarCollapsed } = await freshStore()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full')
    })

    sidebarStore.actions.setCollapsed(true)

    expect(sidebarCollapsed.get()).toBe(true)
  })

  test('toggle flips what is shown', async () => {
    const { sidebarStore, sidebarCollapsed } = await freshStore()

    sidebarStore.actions.toggle()
    expect(sidebarCollapsed.get()).toBe(true)
    sidebarStore.actions.toggle()
    expect(sidebarCollapsed.get()).toBe(false)
  })
})

describe('a page with its own aside (the rail)', () => {
  test('folds the sidebar whatever was stored', async () => {
    localStorage.setItem('admin-sidebar', 'expanded')
    const { sidebarStore, sidebarCollapsed } = await freshStore()

    sidebarStore.actions.setRail(true)

    expect(sidebarCollapsed.get()).toBe(true)
  })

  test('a toggle lasts for the visit and is never written', async () => {
    localStorage.setItem('admin-sidebar', 'expanded')
    const { sidebarStore, sidebarCollapsed } = await freshStore()
    sidebarStore.actions.setRail(true)

    sidebarStore.actions.toggle()

    expect(sidebarCollapsed.get()).toBe(false)
    expect(localStorage.getItem('admin-sidebar')).toBe('expanded')
    expect(sidebarStore.get().stored).toBe(false)
  })

  test('leaving returns to the stored choice, and the next rail page starts folded again', async () => {
    const { sidebarStore, sidebarCollapsed } = await freshStore()
    sidebarStore.actions.setRail(true)
    sidebarStore.actions.toggle()
    expect(sidebarCollapsed.get()).toBe(false)

    sidebarStore.actions.setRail(false)
    expect(sidebarCollapsed.get()).toBe(false)
    sidebarStore.actions.setCollapsed(true)
    sidebarStore.actions.setRail(false)
    expect(sidebarCollapsed.get()).toBe(true)

    sidebarStore.actions.setRail(true)
    expect(sidebarStore.get().visit).toBeNull()
    expect(sidebarCollapsed.get()).toBe(true)
  })

  test('repeating the visit toggle keeps the same state object', async () => {
    const { sidebarStore } = await freshStore()
    sidebarStore.actions.setRail(true)
    sidebarStore.actions.setCollapsed(false)
    const before = sidebarStore.get()
    expect(before.visit).toBe(false)

    sidebarStore.actions.setCollapsed(false)

    expect(sidebarStore.get()).toBe(before)
  })
})

describe('reset when the admin layout unmounts', () => {
  test('keeps the stored choice and drops the rail and the visit toggle', async () => {
    const { sidebarStore, sidebarCollapsed } = await freshStore()
    sidebarStore.actions.setCollapsed(true)
    sidebarStore.actions.setRail(true)
    sidebarStore.actions.toggle()
    expect(sidebarCollapsed.get()).toBe(false)

    sidebarStore.actions.reset()

    expect(sidebarStore.get()).toEqual({ stored: true, rail: false, visit: null })
    expect(sidebarCollapsed.get()).toBe(true)
  })

  test('with nothing to drop, keeps the same state object', async () => {
    const { sidebarStore } = await freshStore()
    sidebarStore.actions.setCollapsed(true)
    const before = sidebarStore.get()

    sidebarStore.actions.reset()

    expect(sidebarStore.get()).toBe(before)
  })
})
