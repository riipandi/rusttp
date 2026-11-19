import { test as base } from '@playwright/test'
import { HomeScreen } from '../screens/home/home.screen.ts'
import { NotFoundScreen } from '../screens/not-found/not-found.screen.ts'

interface Screens {
  home: HomeScreen
  notFound: NotFoundScreen
}

export const test = base.extend<Screens>({
  home: async ({ page }, use) => {
    await use(new HomeScreen(page))
  },
  notFound: async ({ page }, use) => {
    await use(new NotFoundScreen(page))
  }
})

export { expect } from '@playwright/test'
