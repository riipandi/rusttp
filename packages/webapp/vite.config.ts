import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { rustServer } from 'plugins/rust-server'
import { stylexPlugin } from 'plugins/stylex'
import { vixum } from 'plugins/vixum'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'

// The Rust server is the only origin the browser opens (:3000, as in production):
// it renders every document (there is no index.html; see packages/plugins/src/vixum.ts) and proxies
// modules and assets here. Vite stays on IPv4 loopback, where the server's proxy points,
// and the HMR socket connects to it directly so a server restart never drops it.
const vite = { host: '127.0.0.1', port: 5173 }

// The shared plugin pins the CSS layers and recovers from the dev media-const race (see
// `plugins/stylex`).
const stylex = (mode: string) =>
  stylexPlugin({
    aliases: { '#/*': resolve('app/*') },
    enableDevClassNames: mode === 'development'
  })

export default defineConfig(({ mode }) => ({
  plugins: [
    vixum({ routeTree: resolve('app/routes.gen.ts'), plugins: () => [stylex(mode)] }),
    // Builds and runs the Rust server in `vite dev`, rebuilding on change.
    rustServer({
      root: resolve('../..'),
      pkg: 'rusttp-server',
      args: ['serve'],
      watch: ['apps', 'crates', 'Cargo.toml'],
      ignore: ['apps/server/frontend'],
      extensions: ['rs', 'toml', 'html', 'js', 'sql'],
      readyTarget: 'rusttp_server::transport::server'
    }),
    paraglideVitePlugin({ project: './project.inlang' }),
    devtoolsJson(),
    devtools({ logging: false }),
    tanstackRouter({
      routesDirectory: resolve('./app/routes'),
      generatedRouteTree: resolve('./app/routes.gen.ts'),
      autoCodeSplitting: true,
      target: 'react'
    }),
    stylex(mode),
    react({ compiler: true })
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
    manifest: true,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1024 * 2,
    rolldownOptions: {
      input: resolve('app/main.tsx'),
      // The React Compiler has already read 'use no memo' by bundling time; dropping it is harmless.
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use no memo'))
          return
        warn(warning)
      }
    },
    outDir: resolve('../../apps/server/frontend'),
    reportCompressedSize: false
  },
  server: {
    ...vite,
    strictPort: true,
    hmr: { host: vite.host, clientPort: vite.port }
  }
}))
