import { paraglideVitePlugin } from '@inlang/paraglide-js'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// The unit tests run in Chromium, like `uilibs`' (a real DOM, `localStorage`, and `matchMedia`).
// This is not `vite.config.ts`: that one starts the Rust server, renders the documents, and
// scans the routes, and a test needs none of it. What the two share is the pipeline that changes
// the code under test: Paraglide writes the messages the modules import, and the React Compiler is
// on so a hook test sees the memoization the app ships with (`.agents/docs/frontend.md`, "Traps").
export default defineConfig({
  plugins: [paraglideVitePlugin({ project: './project.inlang' }), react({ compiler: true })],
  resolve: { tsconfigPaths: true },
  test: {
    include: ['app/**/*.test.{ts,tsx}'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }]
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: '.output/coverage',
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/paraglide/**',
        'app/routes.gen.ts',
        'app/fixtures/**',
        'app/**/*.test.{ts,tsx}'
      ]
    }
  }
})
