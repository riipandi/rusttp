import { createStore } from '@tanstack/store'
import { notifications } from '#/fixtures/notifications'

// Placeholder source: the sample list (`fixtures/notifications.ts`) held in memory until a
// notification endpoint exists. Reading and acting on it is the contract the popover needs; swapping
// the source for a query leaves the components alone. A reload brings the sample back.
export const notificationsStore = createStore(notifications, ({ setState }) => ({
  setRead: (id: string, read: boolean) =>
    setState((items) => items.map((item) => (item.id === id ? { ...item, read } : item))),
  markAllRead: () =>
    setState((items) => items.map((item) => (item.read ? item : { ...item, read: true }))),
  dismiss: (id: string) => setState((items) => items.filter((item) => item.id !== id)),
  dismissAll: () => setState(() => [])
}))

/** Every bell, the sidebar, and the command bar read this one number, so none of them disagrees. */
export const unreadCount = createStore(
  () => notificationsStore.get().filter((item) => !item.read).length
)
