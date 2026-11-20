import { routes } from '../../utils/routes.ts'
import { AppScreen } from '../shared/app.screen.ts'

export class AdminScreen extends AppScreen {
  async open() {
    await this.page.goto(routes.admin)
  }

  heading() {
    return this.page.getByRole('heading', { name: 'Admin', level: 1 })
  }

  sidebar() {
    return this.page.getByRole('navigation', { name: 'Admin' })
  }
}
