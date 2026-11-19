import { test as base } from '@playwright/test'
import { DashboardScreen } from '../screens/dashboard/dashboard.screen.ts'
import { HomeScreen } from '../screens/home/home.screen.ts'
import { NotFoundScreen } from '../screens/not-found/not-found.screen.ts'

interface Screens {
  dashboard: DashboardScreen
  home: HomeScreen
  notFound: NotFoundScreen
}

export const test = base.extend<Screens>({
  dashboard: async ({ page }, use) => {
    await use(new DashboardScreen(page))
  },
  home: async ({ page }, use) => {
    await use(new HomeScreen(page))
  },
  notFound: async ({ page }, use) => {
    await use(new NotFoundScreen(page))
  }
})

export { expect } from '@playwright/test'
