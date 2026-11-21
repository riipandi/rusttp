import * as React from 'react'

export interface NotificationItem {
  id: string
  title: string
  body: string
  /** Shown as written: there is no clock behind this sample data. */
  time: string
  read: boolean
}

// Placeholder source: sample data held in memory until a notification endpoint exists. Reading and
// acting on it is the contract the popover needs (`useNotifications`); swapping the source for a
// query leaves the components alone. A reload brings the sample back.
let items: NotificationItem[] = [
  {
    id: 'quidditch',
    title: 'Loan overdue',
    body: 'Quidditch Through the Ages was due on Nov 12 and is still with Harry Potter.',
    time: '12 min ago',
    read: false
  },
  {
    id: 'sophie',
    title: 'New member',
    body: 'Sophie Neveu joined the Hogwarts library.',
    time: '1 hour ago',
    read: false
  },
  {
    id: 'symbol',
    title: 'Due soon',
    body: 'The Lost Symbol is due back from Robert Langdon on Nov 23.',
    time: '3 hours ago',
    read: false
  },
  {
    id: 'angels',
    title: 'Book returned',
    body: 'Katherine Solomon returned Angels & Demons.',
    time: 'Yesterday',
    read: true
  },
  {
    id: 'history',
    title: 'Reservation ready',
    body: 'Hogwarts: A History is waiting for Hermione Granger at the front desk.',
    time: '2 days ago',
    read: true
  }
]

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
