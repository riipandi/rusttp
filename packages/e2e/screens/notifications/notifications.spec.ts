import { expect, test } from '../../fixtures/test.ts'
import { routes } from '../../utils/routes.ts'

// The same popover sits under each layout's bell and links to that layout's own page.
const layouts = [
  { name: 'customer', path: routes.dashboard, all: '/notifications' },
  { name: 'admin', path: routes.admin, all: '/admin/notifications' }
]

for (const { name, path, all } of layouts) {
  test.describe(`${name} notifications`, () => {
    test('the bell counts the unread and the popover lists them', async ({ notifications }) => {
      await notifications.open(path)
      await expect(notifications.bell()).toHaveAccessibleName('Notifications, 3 unread')

      await notifications.bell().click()
      await expect(notifications.popover().getByText('3 new')).toBeVisible()
      await expect(notifications.popover().getByText('Loan overdue')).toBeVisible()
    })

    test('quick actions mark a notification read, dismiss it, or mark all read', async ({
      notifications
    }) => {
      await notifications.open(path)
      await notifications.bell().click()
      const popover = notifications.popover()

      await popover.getByRole('button', { name: 'Mark Loan overdue as read' }).click()
      await expect(notifications.bell()).toHaveAccessibleName('Notifications, 2 unread')
      await expect(
        popover.getByRole('button', { name: 'Mark Loan overdue as unread' })
      ).toBeVisible()

      await popover.getByRole('button', { name: 'Dismiss New member' }).click()
      await expect(popover.getByText('New member')).toHaveCount(0)
      await expect(notifications.bell()).toHaveAccessibleName('Notifications, 1 unread')

      await popover.getByRole('button', { name: 'Mark all read' }).click()
      await expect(notifications.bell()).toHaveAccessibleName('Notifications')
    })

    test('the footer link opens the page with every notification', async ({ notifications }) => {
      await notifications.open(path)
      await notifications.bell().click()
      await notifications.allLink().click()

      await expect(notifications.page).toHaveURL(all)
      await expect(notifications.popover()).toHaveCount(0)
      await expect(notifications.page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
    })

    test('Escape closes the popover and returns focus to the bell', async ({ notifications }) => {
      await notifications.open(path)
      await notifications.bell().click()
      await expect(notifications.popover()).toBeVisible()

      await notifications.page.keyboard.press('Escape')
      await expect(notifications.popover()).toHaveCount(0)
      await expect(notifications.bell()).toBeFocused()
    })
  })
}
