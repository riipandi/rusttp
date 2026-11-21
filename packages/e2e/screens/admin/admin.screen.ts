import { routes } from '../../utils/routes.ts'
import { AppScreen } from '../shared/app.screen.ts'

export class AdminScreen extends AppScreen {
  async open() {
    await this.page.goto(routes.admin)
  }

  heading() {
    return this.page.getByRole('heading', { name: 'Overview', level: 1 })
  }

  sidebar() {
    return this.page.getByRole('navigation', { name: 'Admin' })
  }

  collapseButton() {
    return this.page.getByRole('button', { name: 'Collapse sidebar' })
  }

  expandButton() {
    return this.page.getByRole('button', { name: 'Expand sidebar' })
  }

  logo() {
    return this.page.getByRole('link', { name: 'Rusttp', exact: true })
  }

  /** Sets the stored collapse before the app reads it, as an earlier visit would have. */
  async storeCollapse(value: string) {
    await this.page.addInitScript((stored) => localStorage.setItem('admin-sidebar', stored), value)
  }
}
