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

  allLink() {
    return this.popover().getByRole('link', { name: /View all notifications/ })
  }
}
