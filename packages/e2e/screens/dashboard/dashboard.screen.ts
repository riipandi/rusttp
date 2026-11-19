import { routes } from '../../utils/routes.ts'
import { AppScreen } from '../shared/app.screen.ts'

export class DashboardScreen extends AppScreen {
  async open() {
    await this.page.goto(routes.dashboard)
  }

  heading() {
    return this.page.getByRole('heading', { name: 'Dashboard', level: 1 })
  }

  loanRow(member: string) {
    return this.page.getByRole('row', { name: new RegExp(member) })
  }
}
