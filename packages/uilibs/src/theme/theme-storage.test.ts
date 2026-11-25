import { afterEach, describe, expect, it } from 'vitest'
import { cookieStorageAdapter, getStorageAdapter, localStorageAdapter } from './theme-storage'

const cookieKeys = new Set<string>()

function setCookie(key: string, value: string) {
  cookieKeys.add(key)
  cookieStorageAdapter.setItem(key, value)
}

afterEach(() => {
  for (const key of cookieKeys) document.cookie = `${key}=;path=/;max-age=0`
  cookieKeys.clear()
  localStorage.clear()
})

describe('cookieStorageAdapter', () => {
  it('reads back what it wrote', () => {
    setCookie('theme', 'dark')
    expect(cookieStorageAdapter.getItem('theme')).toBe('dark')
  })

  it('round-trips a key that holds regular-expression characters', () => {
    setCookie('ui.theme+v2', 'light')
    expect(cookieStorageAdapter.getItem('ui.theme+v2')).toBe('light')
  })

  it('does not let a dot in the key match another character', () => {
    setCookie('uiXtheme', 'dark')
    expect(cookieStorageAdapter.getItem('ui.theme')).toBeNull()
  })

  it('does not read a cookie whose name only ends with the key', () => {
    setCookie('my-theme', 'dark')
    expect(cookieStorageAdapter.getItem('theme')).toBeNull()
  })

  it('removes a cookie it wrote', () => {
    setCookie('theme', 'dark')
    cookieStorageAdapter.removeItem?.('theme')
    expect(cookieStorageAdapter.getItem('theme')).toBeNull()
  })
})

describe('localStorageAdapter', () => {
  it('reads, writes, and removes', () => {
    localStorageAdapter.setItem('theme', 'light')
    expect(localStorageAdapter.getItem('theme')).toBe('light')
    localStorageAdapter.removeItem?.('theme')
    expect(localStorageAdapter.getItem('theme')).toBeNull()
  })

  it('tells a subscriber about its own key and no other', () => {
    const seen: (string | null)[] = []
    const unsubscribe = localStorageAdapter.subscribe?.('theme', (value) => seen.push(value))
    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'x' }))
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }))
    unsubscribe?.()
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'light' }))
    expect(seen).toEqual(['dark'])
  })
})

describe('getStorageAdapter', () => {
  it('picks the built-in adapters by name and passes a custom one through', () => {
    expect(getStorageAdapter()).toBe(localStorageAdapter)
    expect(getStorageAdapter('cookie')).toBe(cookieStorageAdapter)
    expect(getStorageAdapter(cookieStorageAdapter)).toBe(cookieStorageAdapter)
  })
})
