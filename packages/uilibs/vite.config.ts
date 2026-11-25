import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { resolve } from 'node:path'
import { stylexPlugin, stylexVitestCleanup } from 'plugins/stylex'
import { defineConfig } from 'vitest/config'

// `STORYBOOK_TEST_BROWSER=firefox|webkit` runs the same stories in another engine: CI does it
// nightly, and it is the local check too (the default run is Chromium, and so is the CI push gate).
const browser: 'chromium' | 'firefox' | 'webkit' =
  process.env.STORYBOOK_TEST_BROWSER === 'firefox' ||
  process.env.STORYBOOK_TEST_BROWSER === 'webkit'
    ? process.env.STORYBOOK_TEST_BROWSER
    : 'chromium'

// One Storybook vitest plugin per project, each awaited once.
// The config factory re-runs on every mode change.
// A story tagged `skip-webkit` is skipped in WebKit only: Base UI's focus guards are role=button
// spans there (aria-hidden in Chromium), which fails axe on the Menubar, F-12 in audit-00002.
// Upstream behavior; every other story runs in all three engines.
const configDir = resolve(import.meta.dirname, '.storybook')
const tags = { skip: browser === 'webkit' ? ['skip-webkit'] : [] }
const storybookLight = await storybookTest({ configDir, tags })
const storybookDark = await storybookTest({ configDir, tags })

// The decorator's theme global defaults to `system`, which follows `prefers-color-scheme`:
// the browser context's `colorScheme` is what puts a project in light or dark, so each
// project runs every story and its axe check in one theme.
const storybookInstance = (colorScheme: 'light' | 'dark') => ({
  exclude: ['./**/*.{test,spec}.{ts,tsx}', '**/node_modules/**'],
  browser: {
    enabled: true,
    headless: true,
    provider: playwright({ contextOptions: { colorScheme } }),
    instances: [{ browser }]
  }
})

// The library's pipeline: StyleX compiles in place (source-sharing)
// and the storybook vitest project tests the stories that live in this
// package. Consumers compile the same sources through their own pipelines.
export default defineConfig(({ mode }) => ({
  plugins: [
    stylexVitestCleanup(),
    react(),
    stylexPlugin({
      aliases: { '#/*': resolve(import.meta.dirname, 'src/*') },
      enableDevClassNames: mode === 'development',
      test: Boolean(process.env.VITEST)
    })
  ],
  envPrefix: ['VITE_', 'PUBLIC_'],
  test: {
    projects: [
      {
        extends: false,
        plugins: [storybookLight],
        test: { name: 'storybook', ...storybookInstance('light') }
      },
      {
        extends: false,
        plugins: [storybookDark],
        test: { name: 'storybook-dark', ...storybookInstance('dark') }
      },
      {
        // Logic that no story exercises (storage adapters, announcements, token contrast), in a real
        // browser like the webapp's tests: `document.cookie` and `localStorage` are the thing under test.
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }]
          }
        }
      }
    ]
  },
  resolve: { tsconfigPaths: true }
}))
