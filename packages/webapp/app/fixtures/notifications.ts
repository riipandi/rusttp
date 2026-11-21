import type { NotificationItem } from '#/libraries/notifications'

// Sample notifications for the popover: replace with the notifications endpoint (see `useNotifications`).
export const notifications: NotificationItem[] = [
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
