import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { rustServer } from './plugins/rust-server.ts'
import { vixum } from './plugins/vixum.ts'

// The Rust server is the only origin the browser opens (:3000, as in production):
// it renders every document (there is no index.html; see plugins/vixum.ts) and proxies
// modules and assets here. Vite stays on IPv4 loopback, where the server's proxy points,
// and the HMR socket connects to it directly so a server restart never drops it.
const vite = { host: '127.0.0.1', port: 5173 }

export default defineConfig({
  plugins: [
    vixum({ routeTree: resolve('app/routes.gen.ts') }),
    // Builds and runs the Rust server in `vite dev`, rebuilding on change.
    rustServer({
      root: resolve('../..'),
      pkg: 'rusttp-server',
      args: ['serve'],
      watch: ['apps', 'crates', 'Cargo.toml'],
      ignore: ['apps/server/frontend'],
      // `.html` and `.js`: the document shell and stub in apps/server/stub, which the binary embeds.
      extensions: ['rs', 'toml', 'html', 'js', 'sql'],
      readyTarget: 'rusttp_server::transport::server'
    }),
    devtoolsJson(),
    devtools({ logging: false }),
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
    // The server reads the entry's tags from the manifest; the entry is the module, not an HTML page.
    manifest: true,
    rolldownOptions: { input: resolve('app/main.tsx') },
    // The server embeds this folder (apps/server/build.rs); it is gitignored.
    outDir: resolve('../../apps/server/frontend'),
    reportCompressedSize: false
  },
  server: { ...vite, strictPort: true, hmr: { host: vite.host, clientPort: vite.port } }
})
