import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { rustServer } from './plugins/rust-server.ts'

// The Rust server is the only origin the browser opens (:3000, as in production): it renders the
// document and proxies modules and assets here. Vite stays on IPv4 loopback, where the server's
// proxy points, and the HMR socket connects to it directly so a server restart never drops it.
const vite = { host: '127.0.0.1', port: 5173 }

export default defineConfig({
  plugins: [
    // Builds and runs the Rust server in `vite dev`, rebuilding on change.
    rustServer({
      root: resolve('../..'),
      pkg: 'rusttp-server',
      args: ['serve'],
      watch: ['apps', 'crates', 'Cargo.toml']
    }),
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
  server: { ...vite, strictPort: true, hmr: { host: vite.host, clientPort: vite.port } },
  preview: { ...vite, strictPort: true }
})
