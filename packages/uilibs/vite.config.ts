import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { resolve } from 'node:path'
import { stylexPlugin, stylexVitestCleanup } from 'plugins/stylex'
import { defineConfig } from 'vitest/config'

// One Storybook vitest plugin per project, each awaited once.
// The config factory re-runs on every mode change.
const configDir = resolve(import.meta.dirname, '.storybook')
const storybookLight = await storybookTest({ configDir })
const storybookDark = await storybookTest({ configDir })

// The decorator's theme global defaults to `system`, which follows `prefers-color-scheme`:
// the browser context's `colorScheme` is what puts a project in light or dark, so each
// project runs every story and its axe check in one theme.
// `STORYBOOK_TEST_BROWSER=firefox|webkit` runs the same stories in another engine (a local check; the default run keeps Chromium).
const browser: 'chromium' | 'firefox' | 'webkit' =
  process.env.STORYBOOK_TEST_BROWSER === 'firefox' ||
  process.env.STORYBOOK_TEST_BROWSER === 'webkit'
    ? process.env.STORYBOOK_TEST_BROWSER
    : 'chromium'
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
      }
    ]
  },
  resolve: { tsconfigPaths: true }
}))
