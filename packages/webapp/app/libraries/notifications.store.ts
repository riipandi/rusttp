import { createStore } from '@tanstack/store'
import { notifications } from '#/fixtures/notifications'

// Placeholder source: the sample list (`fixtures/notifications.ts`) held in memory until a
// notification endpoint exists. Reading and acting on it is the contract the popover needs; swapping
// the source for a query leaves the components alone. A reload brings the sample back.
// Each action returns the same array when it changes nothing, so a subscriber does not render for it.
export const notificationsStore = createStore(notifications, ({ setState }) => ({
  setRead: (id: string, read: boolean) =>
    setState((items) =>
      items.some((item) => item.id === id && item.read !== read)
        ? items.map((item) => (item.id === id ? { ...item, read } : item))
        : items
    ),
  markAllRead: () =>
    setState((items) =>
      items.some((item) => !item.read) ? items.map((item) => ({ ...item, read: true })) : items
    ),
  dismiss: (id: string) =>
    setState((items) =>
      items.some((item) => item.id === id) ? items.filter((item) => item.id !== id) : items
    ),
  dismissAll: () => setState((items) => (items.length === 0 ? items : []))
}))

/** Every bell, the sidebar, and the command bar read this one number, so none of them disagrees. */
export const unreadCount = createStore(
  () => notificationsStore.get().filter((item) => !item.read).length
)
