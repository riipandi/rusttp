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

    test('the row menu marks a notification read or unread, or dismisses it', async ({
      notifications
    }) => {
      await notifications.open(path)
      await notifications.bell().click()
      const popover = notifications.popover()
      const choose = (label: string) => notifications.choose(label)

      // The menu opens over the popover: the popover stays open while it is used.
      await notifications.rowMenu('Loan overdue').click()
      await choose('Mark as read')
      await expect(notifications.bell()).toHaveAccessibleName('Notifications, 2 unread')
      await expect(popover).toBeVisible()

      await notifications.rowMenu('Loan overdue').click()
      await choose('Mark as unread')
      await expect(notifications.bell()).toHaveAccessibleName('Notifications, 3 unread')

      await notifications.rowMenu('New member').click()
      await choose('Dismiss')
      await expect(popover.getByText('New member')).toHaveCount(0)
      await expect(notifications.bell()).toHaveAccessibleName('Notifications, 2 unread')
    })

    test('the header menu marks all read, or dismisses all', async ({ notifications }) => {
      await notifications.open(path)
      await notifications.bell().click()
      const choose = (label: string) => notifications.choose(label)

      await notifications.headerMenu().click()
      await choose('Mark all read')
      await expect(notifications.bell()).toHaveAccessibleName('Notifications')

      // Nothing is unread now, so the item is disabled; dismissing still works.
      await notifications.headerMenu().click()
      await expect(
        notifications.page.getByRole('menuitem', { name: 'Mark all read' })
      ).toBeDisabled()
      await choose('Dismiss all')
      await expect(notifications.popover().getByText('You are all caught up')).toBeVisible()
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
