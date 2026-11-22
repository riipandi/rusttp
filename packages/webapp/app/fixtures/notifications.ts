import type { NotificationResponse } from '#/schemas/notifications.schema'

// The sample's timestamps are offsets from when the page loads, so "12 minutes ago" stays true; a
// notification endpoint returns real ISO timestamps instead.
const ago = (ms: number) => new Date(Date.now() - ms).toISOString()
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Sample notifications for the popover: replace with the notifications endpoint (see `libraries/notifications.store.ts`).
export const notifications: NotificationResponse[] = [
  {
    id: 'quidditch',
    title: 'Loan overdue',
    body: 'Quidditch Through the Ages was due on Nov 12 and is still with Harry Potter.',
    time: ago(12 * MINUTE),
    read: false
  },
  {
    id: 'sophie',
    title: 'New member',
    body: 'Sophie Neveu joined the Hogwarts library.',
    time: ago(HOUR),
    read: false
  },
  {
    id: 'symbol',
    title: 'Due soon',
    body: 'The Lost Symbol is due back from Robert Langdon on Nov 23.',
    time: ago(3 * HOUR),
    read: false
  },
  {
    id: 'angels',
    title: 'Book returned',
    body: 'Katherine Solomon returned Angels & Demons.',
    time: ago(DAY + HOUR),
    read: true
  },
  {
    id: 'history',
    title: 'Reservation ready',
    body: 'Hogwarts: A History is waiting for Hermione Granger at the front desk.',
    time: ago(2 * DAY + HOUR),
    read: true
  }
]
