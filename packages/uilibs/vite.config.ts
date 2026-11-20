import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { resolve } from 'node:path'
import { stylexPlugin, stylexVitestCleanup } from 'plugins/stylex'
import { defineConfig } from 'vitest/config'

// The Storybook vitest project's plugin; awaited once.
// The config factory re-runs on every mode change.
const storybookProject = await storybookTest({
  configDir: resolve(import.meta.dirname, '.storybook')
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
        plugins: [storybookProject],
        test: {
          name: 'storybook',
          exclude: ['./**/*.{test,spec}.{ts,tsx}', '**/node_modules/**'],
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
