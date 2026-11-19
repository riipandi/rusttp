import fs from 'node:fs'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

export interface VixumOptions {
  /** The route tree TanStack Router generates (`generatedRouteTree` in tsr.config.json). */
  routeTree: string
}

/** The full paths in the generated route tree's `FileRoutesByFullPath` interface. */
function readRoutes(routeTree: string): string[] | null {
  if (!fs.existsSync(routeTree)) return null
  const source = fs.readFileSync(routeTree, 'utf8')
  const block = /export interface FileRoutesByFullPath \{([^}]*)\}/.exec(source)?.[1]
  if (block === undefined) return null
  return [...block.matchAll(/^\s*'([^']+)':/gm)].map((match) => match[1] ?? '')
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
  return {
    name: 'vixum',
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
      server.middlewares.use('/__vixum/routes.json', (_req, res) => {
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(readRoutes(opts.routeTree)))
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'routes.json',
        source: JSON.stringify(readRoutes(opts.routeTree))
      })
    }
  }
}
