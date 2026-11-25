import type { UserOptions } from '@stylexjs/unplugin'
import stylex from '@stylexjs/unplugin/vite'
import { createServer } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'

/**
 * The one StyleX pipeline every frontend package shares. Source-sharing
 * packages compile in place, so the plugin must appear in each consumer's
 * vite config with that package's own alias map (`#/*` → its src). CSS layers
 * are pinned here so every consumer emits identically ordered styles.
 */
export function stylexPlugin(options: StylexPluginOptions): Plugin {
  const { lightningcssOptions, ...rest } = options
  const plugin: Plugin = stylex({
    useCSSLayers: { before: ['reset'], prefix: 'stylex' },
    ...rest,
    lightningcssOptions: {
      ...lightningcssOptions,
      exclude: (lightningcssOptions?.exclude ?? 0) | LIGHTNINGCSS_DIR_SELECTOR
    }
  })
  return plugin
}

/**
 * lightningcss `Features.DirSelector`. The unplugin lowers CSS for the default browserslist, which
 * still lists Chrome 109, and for that target rewrites `:dir(rtl)` into a `:lang(ar), :lang(he), …`
 * list: a rule that flips a transform then follows `lang` instead of `dir` (issue-00007). Every
 * engine the tests cover supports `:dir()`, so it stays. `lightningcss` is not a dependency of
 * this package, hence the literal; the RTL stories fail if the flag stops working.
 */
const LIGHTNINGCSS_DIR_SELECTOR = 4

/**
 * StyleX starts a dev HMR interval in configureServer and only clears it on
 * httpServer 'close'. Vitest's server has no httpServer, so the interval
 * keeps the process alive — this fake provides the close signal. Must be
 * registered before the StyleX plugin.
 */
export function stylexVitestCleanup(): Plugin {
  let server: ViteDevServer | undefined
  const closeHttpServer = () => {
    server?.httpServer?.emit('close')
  }
  return {
    name: 'vitest-stylex-cleanup',
    enforce: 'pre',
    apply: 'serve',
    configureServer(devServer) {
      server = devServer
      if (!devServer.httpServer) {
        devServer.httpServer = createServer()
      }
    },
    buildEnd: closeHttpServer,
    closeWatcher: closeHttpServer
  }
}

// Re-export UserOptions as StylexPluginOptions
export type StylexPluginOptions = Partial<UserOptions>
