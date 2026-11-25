import { act } from 'react'
import { beforeEach, describe, expect, test } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { formatDate, formatNumber, formatRelative, useFormat } from '#/libraries/format'
import { localeStore } from '#/libraries/locale.store'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const now = Date.parse('2026-11-22T12:00:00Z')
const ago = (ms: number) => new Date(now - ms).toISOString()

describe('formatRelative', () => {
  test.each([
    ['12 minutes', 12 * MINUTE, '12 minutes ago'],
    ['59 minutes, the last before the hour', 59 * MINUTE, '59 minutes ago'],
    ['60 minutes, the first hour', 60 * MINUTE, '1 hour ago'],
    ['23 hours, the last before the day', 23 * HOUR, '23 hours ago'],
    ['24 hours, the first day', 24 * HOUR, 'yesterday'],
    ['2 days', 2 * DAY, '2 days ago'],
    ['5 days', 5 * DAY, '5 days ago']
  ])('in English, %s ago reads "%s"', (_name, elapsed, expected) => {
    expect(formatRelative(ago(elapsed), 'en', now)).toBe(expected)
  })

  test.each([
    [12 * MINUTE, '12 menit yang lalu'],
    [60 * MINUTE, '1 jam yang lalu'],
    [24 * HOUR, 'kemarin'],
    [3 * DAY, '3 hari yang lalu']
  ])('in Indonesian, %i ms ago reads "%s"', (elapsed, expected) => {
    expect(formatRelative(ago(elapsed), 'id', now)).toBe(expected)
  })

  test('a timestamp ahead of now looks forward', () => {
    expect(formatRelative(new Date(now + 5 * MINUTE).toISOString(), 'en', now)).toBe('in 5 minutes')
    expect(formatRelative(new Date(now + 3 * HOUR).toISOString(), 'en', now)).toBe('in 3 hours')
  })
})

describe('formatNumber', () => {
  test('groups thousands the way the language does', () => {
    expect(formatNumber(2418, 'en')).toBe('2,418')
    expect(formatNumber(2418, 'id')).toBe('2.418')
    expect(formatNumber(1_234_567, 'en')).toBe('1,234,567')
  })

  test('adds no separator below a thousand', () => {
    expect(formatNumber(999, 'en')).toBe('999')
    expect(formatNumber(999, 'id')).toBe('999')
  })
})

describe('formatDate', () => {
  test('writes the day and short month, without a year, in the order the language uses', () => {
    expect(formatDate('2026-11-28T12:00:00Z', 'en')).toBe('Nov 28')
    expect(formatDate('2026-11-28T12:00:00Z', 'id')).toBe('28 Nov')
  })
})

describe('useFormat', () => {
  beforeEach(() => localeStore.setState(() => 'en'))

  test('formats in the language shown and again after it changes', async () => {
    const { result } = await renderHook(() => useFormat())
    expect(result.current.number(2418)).toBe('2,418')
    expect(result.current.date('2026-11-28T12:00:00Z')).toBe('Nov 28')

    await act(async () => localeStore.actions.set('id'))

    expect(result.current.number(2418)).toBe('2.418')
    expect(result.current.date('2026-11-28T12:00:00Z')).toBe('28 Nov')
    await act(async () => localeStore.actions.set('en'))
  })
})
