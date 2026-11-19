import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, type ProxyOptions } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'

// Proxying keeps the browser on one origin, so session cookies stay first-party.
const backend = process.env.BACKEND_URL ?? 'http://127.0.0.1:3000'
const proxy: Record<string, ProxyOptions> = {
  '/api': { target: backend },
  '/rpc': { target: backend },
  '/healthz': { target: backend }
}

export default defineConfig({
  plugins: [
    // Serves the Chrome DevTools workspace file, so edits in DevTools map back to the sources.
    devtoolsJson(),
    devtools(),
    // Reads tsr.config.json, the file `tsr generate` (build, typecheck) uses too.
    tanstackRouter(),
    react()
  ],
  envPrefix: ['VITE_', 'PUBLIC_'],
  define: { 'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(process.env.npm_package_version) },
  // Pre-bundled up front, so opening the devtools never triggers a mid-session reload.
  optimizeDeps: {
    include: [
      '@tanstack/react-devtools',
      '@tanstack/react-query-devtools',
      '@tanstack/react-router-devtools'
    ]
  },
  resolve: { tsconfigPaths: true },
  build: {
    emptyOutDir: true,
    // The server embeds this folder (apps/server/build.rs); it is gitignored.
    outDir: resolve('../../apps/server/frontend'),
    reportCompressedSize: false
  },
  server: { port: 5173, strictPort: true, proxy },
  preview: { port: 5173, strictPort: true, proxy }
})
