import { defineConfig, devices, type HtmlReporterOptions } from '@playwright/test'

const ENV = {
  baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3000'
}

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
    { name: 'Mobile Safari', use: { ...devices['iPhone 16'] } },
    { name: 'Safari', use: { ...devices['Desktop Safari'] } }
  ],
  // `E2E_BASE_URL` points the tests at servers that are already running. Otherwise the Rust
  // server and the built SPA (vite preview, proxying the API to the server) start here.
  // The server embeds the built SPA (and serves it from disk in a debug build), so one process
  // answers the documents, the assets, and the API, as in production.
  webServer: process.env['E2E_BASE_URL']
    ? []
    : [
        {
          command: 'pnpm --filter webapp build && cargo run -q -p rusttp-server -- serve',
          url: new URL('/healthz', ENV.baseURL).href,
          reuseExistingServer: !process.env['CI'],
          timeout: 300_000,
          env: {
            BIND_ADDR: new URL(ENV.baseURL).host,
            RUST_LOG: 'warn'
          }
        }
      ]
})
