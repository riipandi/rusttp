import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, type ProxyOptions } from 'vite'

// The Rust server (`just dev`). Proxying keeps the browser on one origin, so
// session cookies stay first-party.
const backend = process.env.BACKEND_URL ?? 'http://127.0.0.1:3000'
const proxy: Record<string, ProxyOptions> = {
  '/api': { target: backend },
  '/healthz': { target: backend }
}

export default defineConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: resolve('./app/routes'),
      generatedRouteTree: resolve('./app/routes.gen.ts'),
      autoCodeSplitting: true,
      target: 'react'
    }),
    react()
  ],
  envPrefix: ['VITE_', 'PUBLIC_'],
  define: { 'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(process.env.npm_package_version) },
  resolve: { tsconfigPaths: true },
  build: {
    emptyOutDir: true,
    outDir: resolve('dist'),
    reportCompressedSize: false
  },
  server: { port: 5173, strictPort: true, proxy },
  preview: { port: 5173, strictPort: true, proxy }
})
