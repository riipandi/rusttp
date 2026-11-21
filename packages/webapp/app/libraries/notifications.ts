import * as React from 'react'
import { notifications } from '#/fixtures/notifications'

export interface NotificationItem {
  id: string
  title: string
  body: string
  /** Shown as written: there is no clock behind this sample data. */
  time: string
  read: boolean
}

// Placeholder source: the sample list (`fixtures/notifications.ts`) held in memory until a
// notification endpoint exists. Reading and acting on it is the contract the popover needs
// (`useNotifications`); swapping the source for a query leaves the components alone. A reload brings
// the sample back.
let items: NotificationItem[] = notifications

const listeners = new Set<() => void>()

function set(next: NotificationItem[]) {
  items = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

const getSnapshot = () => items

const actions = {
  setRead: (id: string, read: boolean) =>
    set(items.map((item) => (item.id === id ? { ...item, read } : item))),
  markAllRead: () => set(items.map((item) => (item.read ? item : { ...item, read: true }))),
  dismiss: (id: string) => set(items.filter((item) => item.id !== id)),
  dismissAll: () => set([])
}

/** Every bell and popover reads one store, so the sidebar and the top bar never disagree. */
export function useNotifications() {
  const current = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const unread = current.filter((item) => !item.read).length
  return { items: current, unread, ...actions }
}
