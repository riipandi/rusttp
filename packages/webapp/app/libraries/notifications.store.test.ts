import { beforeEach, describe, expect, test } from 'vitest'
import { notifications } from '#/fixtures/notifications'
import { notificationsStore, unreadCount } from '#/libraries/notifications.store'

// The store is a module singleton seeded from `fixtures/notifications.ts`: three unread
// (quidditch, sophie, symbol) and two read (angels, history). Vitest's browser mode cannot reset
// modules (`vi.resetModules` does nothing there), so each case puts the seed back.
beforeEach(() => notificationsStore.setState(() => notifications))

const ids = (items: { id: string }[]) => items.map((item) => item.id)

describe('notificationsStore', () => {
  test('setRead changes only the named notification', () => {
    const before = notificationsStore.get()

    notificationsStore.actions.setRead('sophie', true)

    const after = notificationsStore.get()
    expect(after).not.toBe(before)
    expect(after.find((item) => item.id === 'sophie')?.read).toBe(true)
    expect(after.filter((item) => item.id !== 'sophie')).toEqual(
      before.filter((item) => item.id !== 'sophie')
    )
    expect(unreadCount.get()).toBe(2)
  })

  test('setRead can mark a read notification unread again', () => {
    notificationsStore.actions.setRead('angels', false)

    expect(notificationsStore.get().find((item) => item.id === 'angels')?.read).toBe(false)
    expect(unreadCount.get()).toBe(4)
  })

  test.each([
    ['one already in that state, unread', 'sophie', false],
    ['one already in that state, read', 'angels', true],
    ['one that does not exist', 'nobody', true]
  ])('setRead keeps the same array for %s', (_name, id, read) => {
    const before = notificationsStore.get()

    notificationsStore.actions.setRead(id, read)

    expect(notificationsStore.get()).toBe(before)
  })

  test('markAllRead reads everything, and the second call changes nothing', () => {
    notificationsStore.actions.markAllRead()
    const after = notificationsStore.get()
    expect(after.every((item) => item.read)).toBe(true)
    expect(after).toHaveLength(5)
    expect(unreadCount.get()).toBe(0)

    notificationsStore.actions.markAllRead()
    expect(notificationsStore.get()).toBe(after)
  })

  test('dismiss removes one notification and lowers the unread count only for an unread one', () => {
    notificationsStore.actions.dismiss('quidditch')
    expect(ids(notificationsStore.get())).toEqual(['sophie', 'symbol', 'angels', 'history'])
    expect(unreadCount.get()).toBe(2)

    notificationsStore.actions.dismiss('history')
    expect(ids(notificationsStore.get())).toEqual(['sophie', 'symbol', 'angels'])
    expect(unreadCount.get()).toBe(2)
  })

  test('dismiss of an unknown id keeps the same array', () => {
    const before = notificationsStore.get()

    notificationsStore.actions.dismiss('nobody')

    expect(notificationsStore.get()).toBe(before)
  })

  test('dismissAll empties the list, and the second call changes nothing', () => {
    notificationsStore.actions.dismissAll()
    const after = notificationsStore.get()
    expect(after).toEqual([])
    expect(unreadCount.get()).toBe(0)

    notificationsStore.actions.dismissAll()
    expect(notificationsStore.get()).toBe(after)
  })
})
