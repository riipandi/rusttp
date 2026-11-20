import { routes } from '../../utils/routes.ts'
import { AppScreen } from '../shared/app.screen.ts'

export class HomeScreen extends AppScreen {
  async open() {
    await this.page.goto(routes.home)
  }

  heading() {
    return this.page.getByRole('heading', { name: 'Rusttp', level: 1 })
  }
}
