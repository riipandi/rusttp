import type { Page } from '@playwright/test'

/** Base for every screen: the page handle and what the root route renders on every page. */
export class AppScreen {
  constructor(readonly page: Page) {}
}
