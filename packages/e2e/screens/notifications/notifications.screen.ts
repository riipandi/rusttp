import { expect } from '@playwright/test'
import { AppScreen } from '../shared/app.screen.ts'

/** The bell and the popover it opens, in whichever layout `path` belongs to. */
export class NotificationsScreen extends AppScreen {
  async open(path: string) {
    await this.page.goto(path)
  }

  bell() {
    return this.page.getByRole('button', { name: /^Notifications/ })
  }

  popover() {
    return this.page.getByRole('dialog', { name: 'Notifications' })
  }

  /** The three-dots menu on the row whose title is `title`. */
  rowMenu(title: string) {
    return this.popover().getByRole('button', { name: `Actions for ${title}` })
  }

  /** The three-dots menu in the popover's header: actions on every notification. */
  headerMenu() {
    return this.popover().getByRole('button', { name: 'Notification actions' })
  }

  /**
   * Picks an item of the open menu, then waits for the menu to finish closing: the next menu
   * would otherwise open beside the old one while it fades out, and both would match.
   */
  async choose(label: string) {
    await this.page.getByRole('menuitem', { name: label }).click()
    await expect(this.page.getByRole('menu')).toHaveCount(0)
  }

  allLink() {
    return this.popover().getByRole('link', { name: /View all notifications/ })
  }
}
