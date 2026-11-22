import { test as base } from '@playwright/test'
import { AdminScreen } from '../screens/admin/admin.screen.ts'
import { DashboardScreen } from '../screens/dashboard/dashboard.screen.ts'
import { HomeScreen } from '../screens/home/home.screen.ts'
import { NotFoundScreen } from '../screens/not-found/not-found.screen.ts'
import { NotificationsScreen } from '../screens/notifications/notifications.screen.ts'

interface Screens {
  admin: AdminScreen
  dashboard: DashboardScreen
  home: HomeScreen
  notFound: NotFoundScreen
  notifications: NotificationsScreen
}

export const test = base.extend<Screens>({
  admin: async ({ page }, use) => {
    await use(new AdminScreen(page))
  },
  dashboard: async ({ page }, use) => {
    await use(new DashboardScreen(page))
  },
  home: async ({ page }, use) => {
    await use(new HomeScreen(page))
  },
  notFound: async ({ page }, use) => {
    await use(new NotFoundScreen(page))
  },
  notifications: async ({ page }, use) => {
    await use(new NotificationsScreen(page))
  }
})

export { expect } from '@playwright/test'
