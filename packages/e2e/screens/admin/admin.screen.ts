import { routes } from '../../utils/routes.ts'
import { AppScreen } from '../shared/app.screen.ts'

export class AdminScreen extends AppScreen {
  async open() {
    await this.page.goto(routes.admin)
  }

  /**
   * Opens the admin and waits until its keyboard shortcuts are live. `goto` returns on `load`, while
   * the layout renders (and registers its hotkeys) a moment later, so a key pressed at once is lost.
   */
  async openReady() {
    await this.open()
    await this.commandTrigger().waitFor()
  }

  heading() {
    return this.page.getByRole('heading', { name: 'Overview', level: 1 })
  }

  sidebar() {
    return this.page.getByRole('navigation', { name: 'Admin' })
  }

  /** The sidebar's search-like trigger. */
  commandTrigger() {
    return this.page.getByRole('button', { name: 'Search and commands' })
  }

  commandBar() {
    return this.page.getByRole('dialog')
  }

  /**
   * Presses a key with the platform's Mod key held (Command on macOS, Control elsewhere). Playwright's
   * `ControlOrMeta` resolves it the same way the app's `Mod` does.
   */
  async mod(key: string) {
    await this.page.keyboard.press(`ControlOrMeta+${key}`)
  }

  collapseButton() {
    return this.page.getByRole('button', { name: 'Collapse sidebar' })
  }

  expandButton() {
    return this.page.getByRole('button', { name: 'Expand sidebar' })
  }

  /** Sets the stored collapse before the app reads it, as an earlier visit would have. */
  async storeCollapse(value: string) {
    await this.page.addInitScript((stored) => localStorage.setItem('admin-sidebar', stored), value)
  }
}
