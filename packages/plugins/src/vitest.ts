import { playwright } from '@vitest/browser-playwright'

export type BrowserName = 'chromium' | 'firefox' | 'webkit'

export interface BrowserProjectOptions {
  /** The engine the project runs in; the default is Chromium. */
  browser?: BrowserName
  /** Sets the context's `prefers-color-scheme`; omitted, the engine's own default applies. */
  colorScheme?: 'light' | 'dark'
  /** `false` opens the window, to watch or debug a test. */
  headless?: boolean
}

/**
 * The `test.browser` block every Vitest project in the repo shares: a real Playwright browser, so
 * `localStorage`, `matchMedia`, and layout are the thing under test and not a jsdom stand-in.
 */
export function browserProject({
  browser = 'chromium',
  colorScheme,
  headless = true
}: BrowserProjectOptions = {}) {
  return {
    enabled: true,
    headless,
    provider: playwright(colorScheme ? { contextOptions: { colorScheme } } : {}),
    instances: [{ browser }]
  }
}
