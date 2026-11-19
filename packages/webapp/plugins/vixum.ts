import type { IncomingMessage } from 'node:http'
import { createServer, type Plugin, type ViteDevServer } from 'vite'

export interface VixumOptions {
  /** The route tree TanStack Router generates (`generatedRouteTree` in tsr.config.json), from the root. */
  routeTree: string
}

/** One navigable route: its full path and the page meta its `staticData` declares. */
interface RouteEntry {
  path: string
  title?: string
  description?: string
}

/** The slice of `@tanstack/react-router` this plugin calls, loaded through Vite's SSR graph. */
interface RouterModule {
  createRouter: (options: { routeTree: unknown; history: unknown }) => {
    routesByPath: Record<string, RouteNode>
  }
  createMemoryHistory: () => unknown
}

const isRouterModule = (
  mod: Record<string, unknown>
): mod is Record<string, unknown> & RouterModule =>
  typeof mod['createRouter'] === 'function' && typeof mod['createMemoryHistory'] === 'function'

interface RouteNode {
  parentRoute?: RouteNode
  options: { staticData?: { pageTitle?: unknown; pageDescription?: unknown } }
}

/**
 * The route table from the route tree itself: a router built over it lists exactly the full paths
 * TanStack Router can navigate to, and each route's title and description are the nearest ones
 * up its parent chain, the way `__root.tsx` picks the title from the deepest match.
 */
async function readRoutes(server: ViteDevServer, routeTree: string): Promise<RouteEntry[]> {
  const tree = await server.ssrLoadModule(routeTree)
  const lib = await server.ssrLoadModule('@tanstack/react-router')
  if (!isRouterModule(lib)) throw new Error('@tanstack/react-router has no createRouter')
  const router = lib.createRouter({
    routeTree: tree['routeTree'],
    history: lib.createMemoryHistory()
  })
  return Object.entries(router.routesByPath).map(([path, route]) => {
    const entry: RouteEntry = { path }
    for (let node: RouteNode | undefined = route; node; node = node.parentRoute) {
      const { pageTitle, pageDescription } = node.options.staticData ?? {}
      if (entry.title === undefined && typeof pageTitle === 'string') entry.title = pageTitle
      if (entry.description === undefined && typeof pageDescription === 'string') {
        entry.description = pageDescription
      }
    }
    return entry
  })
}

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => (body += chunk))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })

/**
 * The Vite side of vixum (`crates/vixum`): the Rust server renders every document, so Vite has
 * no index.html. In dev it runs the server's document through `transformIndexHtml` (the HMR
 * client, the React preamble, other plugins' tags) and answers the route table; a build writes
 * the route table to `routes.json`, beside the manifest the server reads its entry tags from.
 */
export function vixum(opts: VixumOptions): Plugin {
  let root = process.cwd()
  return {
    name: 'vixum',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      server.middlewares.use('/__vixum/transform', (req, res, next) => {
        if (req.method !== 'POST') return next()
        const url = new URL(req.url ?? '/', 'http://vixum').searchParams.get('url') ?? '/'
        readBody(req)
          .then((html) => server.transformIndexHtml(url, html))
          .then((html) => {
            res.setHeader('content-type', 'text/html; charset=utf-8')
            res.end(html)
          })
          .catch(next)
      })
      // Read per request through the SSR module graph, so a route file edit shows up at once.
      server.middlewares.use('/__vixum/routes.json', (_req, res, next) => {
        readRoutes(server, opts.routeTree)
          .then((routes) => {
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(routes))
          })
          .catch(next)
      })
    },
    async generateBundle() {
      // A throwaway SSR server with no config file, so this plugin (and the Rust one) stay out of it.
      const server = await createServer({
        configFile: false,
        root,
        logLevel: 'silent',
        appType: 'custom',
        resolve: { tsconfigPaths: true },
        server: { middlewareMode: true, hmr: false, ws: false }
      })
      try {
        const routes = await readRoutes(server, opts.routeTree)
        this.emitFile({ type: 'asset', fileName: 'routes.json', source: JSON.stringify(routes) })
      } finally {
        await server.close()
      }
    }
  }
}
