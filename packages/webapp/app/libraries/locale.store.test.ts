import { beforeEach, describe, expect, test } from 'vitest'
import { localeStore } from '#/libraries/locale.store'

// The store is a module singleton and Vitest's browser mode cannot reset modules, so each case
// starts from English with an empty `localStorage` and the document as the server renders it.
beforeEach(() => {
  localStorage.clear()
  localeStore.setState(() => 'en')
  document.documentElement.lang = 'en'
  document.documentElement.dir = 'ltr'
})

describe('localeStore.set', () => {
  test('shows the language, remembers it, and tells the document', () => {
    localeStore.actions.set('id')

    expect(localeStore.get()).toBe('id')
    expect(localStorage.getItem('locale')).toBe('id')
    expect(document.documentElement.lang).toBe('id')
  })

  test('changing back is remembered too', () => {
    localeStore.actions.set('id')
    localeStore.actions.set('en')

    expect(localeStore.get()).toBe('en')
    expect(localStorage.getItem('locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  test('the language already shown is a no-op: nothing stored, the document left alone', () => {
    document.documentElement.lang = 'sentinel'

    localeStore.actions.set('en')

    expect(localStorage.getItem('locale')).toBeNull()
    expect(document.documentElement.lang).toBe('sentinel')
  })
})

describe('the language a visit starts in', () => {
  let visit = 0
  async function freshStore() {
    const path = `./locale.store.ts?visit=${++visit}`
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the same module, loaded under another URL
    return (await import(/* @vite-ignore */ path)) as typeof import('./locale.store')
  }

  test('takes the stored language and sets the document to it', async () => {
    localStorage.setItem('locale', 'id')

    const { localeStore: fresh } = await freshStore()

    expect(fresh.get()).toBe('id')
    expect(document.documentElement.lang).toBe('id')
  })

  test('ignores a stored language the app does not have', async () => {
    localStorage.setItem('locale', 'fr')

    const { localeStore: fresh } = await freshStore()

    expect(['en', 'id']).toContain(fresh.get())
    expect(fresh.get()).not.toBe('fr')
  })
})
