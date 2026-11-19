import { defineConfig, devices, type HtmlReporterOptions } from '@playwright/test'
import { ENV } from './config.ts'

const htmlReporterOpts = {
  outputFolder: '.output/e2e-result',
  open: 'never'
} satisfies HtmlReporterOptions

export default defineConfig({
  testDir: 'screens',
  testMatch: '**/*.spec.ts',
  outputDir: '.output/e2e',
  reporter: [['list'], ['html', htmlReporterOpts]],
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  use: {
    baseURL: ENV.baseURL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
    { name: 'Safari', use: { ...devices['Desktop Safari'] } }
  ],
  // `E2E_BASE_URL` points the tests at servers that are already running. Otherwise the Rust
  // server and the built SPA (vite preview, proxying the API to the server) start here.
  webServer: process.env['E2E_BASE_URL']
    ? []
    : [
        {
          command: 'cargo run -q -p rusttp-server -- serve',
          url: new URL('/healthz', ENV.backendURL).href,
          reuseExistingServer: !process.env['CI'],
          timeout: 300_000,
          env: { BIND_ADDR: new URL(ENV.backendURL).host, RUST_LOG: 'warn' }
        },
        {
          command: 'pnpm --filter webapp build && pnpm --filter webapp preview',
          url: ENV.baseURL,
          reuseExistingServer: !process.env['CI'],
          timeout: 120_000,
          env: { BACKEND_URL: ENV.backendURL }
        }
      ]
})
