import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import type { Plugin } from 'vite'

export interface RustServerOptions {
  /** The Cargo workspace root, where `cargo` runs and the binary starts. */
  root: string
  /** The Cargo package to build; its binary has the same name. */
  pkg: string
  /** Arguments the binary starts with. */
  args: string[]
  /** Directories under `root` whose changes trigger a rebuild. */
  watch: string[]
  /** Directories under `root` to leave out of the watch (build output the server embeds). */
  ignore: string[]
  /** Extensions that trigger a rebuild: sources, manifests, and files the binary embeds. */
  extensions: string[]
  /**
   * The tracing target that logs `listening`; the plugin forces it to `info` whatever `LOG_LEVEL`
   * says, because that line is how it knows the new server took the port.
   */
  readyTarget: string
}

const tag = '\x1b[33m[rust]\x1b[0m'
const log = (msg: string) => console.info(`${tag} ${msg}`)

/** Ctrl-C semantics, so in-flight requests finish; forced after 5 s. Resolves once it exits. */
const retire = (proc: ChildProcess | null) =>
  new Promise<void>((resolve) => {
    if (!proc || proc.exitCode !== null) return resolve()
    proc.once('exit', () => resolve())
    proc.kill('SIGINT')
    setTimeout(() => proc.exitCode === null && proc.kill('SIGKILL'), 5000).unref()
  })

/**
 * Builds and runs the Rust server inside `vite dev`; the browser opens the server, which renders
 * the document and proxies everything else to Vite (`VITE_DEV_SERVER`). A change rebuilds first
 * and swaps processes only after a successful build: the new server binds the shared port
 * (`SO_REUSEPORT` in debug builds) and the old one stops once the new one listens, so the port
 * never goes dark and a failed build leaves the running server alone.
 */
export function rustServer(opts: RustServerOptions): Plugin {
  const targetDir = process.env.CARGO_TARGET_DIR ?? path.join(opts.root, 'target')
  const bin = path.join(targetDir, 'debug', opts.pkg)
  const watched = opts.watch.map((dir) => path.join(opts.root, dir))
  const ignored = [targetDir, ...opts.ignore.map((dir) => path.join(opts.root, dir))]
  const extensions = new Set(opts.extensions.map((ext) => `.${ext}`))
  const logLevel = `${process.env.LOG_LEVEL || 'info'},${opts.readyTarget}=info`
  const appUrl = `http://${process.env.BIND_ADDR ?? '127.0.0.1:3000'}`

  let child: ChildProcess | null = null
  let building = false
  let pending = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let closed = false

  const build = () =>
    new Promise<boolean>((resolve) => {
      const started = Date.now()
      log(`building ${opts.pkg}…`)
      spawn('cargo', ['build', '-p', opts.pkg], {
        cwd: opts.root,
        stdio: ['ignore', 'inherit', 'inherit']
      }).on('close', (code) => {
        const secs = ((Date.now() - started) / 1000).toFixed(1)
        log(
          code === 0 ? `built in ${secs}s` : `build failed in ${secs}s, keeping the running server`
        )
        resolve(code === 0)
      })
    })

  /** Starts the binary; resolves once it logs `listening`, or with null when it exits first. */
  const launch = (viteOrigin: string) =>
    new Promise<ChildProcess | null>((resolve) => {
      log(child ? 'starting the new server beside the running one…' : 'starting the server…')
      const proc = spawn(bin, opts.args, {
        cwd: opts.root,
        env: { ...process.env, LOG_LEVEL: logLevel, VITE_DEV_SERVER: viteOrigin },
        stdio: ['ignore', 'pipe', 'inherit']
      })
      let ready = false
      proc.stdout?.on('data', (chunk: Buffer) => {
        process.stdout.write(chunk)
        if (!ready && chunk.toString().includes('listening')) {
          ready = true
          resolve(proc)
        }
      })
      proc.once('exit', (code, signal) => {
        if (!ready) {
          log(`server failed to start (${signal ?? `code ${code}`})`)
          resolve(null)
        } else if (child === proc && !closed) {
          log(`server exited (${signal ?? `code ${code}`})`)
        }
      })
    })

  const rebuild = async (viteOrigin: string) => {
    if (building) {
      pending = true
      return
    }
    building = true
    const ok = await build()
    if (ok && !closed) {
      const first = child === null
      let next = await launch(viteOrigin)
      // Without SO_REUSEPORT (Windows) the new server cannot bind beside the old one: stop the
      // old one first, accepting the gap, rather than never applying the change.
      if (!next && child) {
        await retire(child)
        child = null
        next = await launch(viteOrigin)
      }
      if (next) {
        const old = child
        child = next
        void retire(old)
        log(first ? `open \x1b[36m${appUrl}\x1b[0m` : 'the new server took over')
      }
    }
    building = false
    if (pending && !closed) {
      pending = false
      void rebuild(viteOrigin)
    }
  }

  const shutdown = () => {
    closed = true
    clearTimeout(timer)
    void retire(child)
  }

  return {
    name: 'rust-server',
    apply: 'serve',
    configureServer(server) {
      const { host, port } = server.config.server
      const viteOrigin = `http://${typeof host === 'string' ? host : '127.0.0.1'}:${port}`
      // Vite's URL is not the one to open; the plugin prints the server's once it listens.
      server.printUrls = () => {}

      server.watcher.add(watched)
      const onChange = (file: string) => {
        if (!extensions.has(path.extname(file))) return
        if (ignored.some((dir) => file.startsWith(dir))) return
        if (!watched.some((dir) => file.startsWith(dir))) return
        clearTimeout(timer)
        timer = setTimeout(() => {
          log(`${path.relative(opts.root, file)} changed`)
          void rebuild(viteOrigin)
        }, 200)
      }
      server.watcher.on('change', onChange)
      server.watcher.on('add', onChange)
      server.watcher.on('unlink', onChange)

      server.httpServer?.once('close', shutdown)
      process.once('exit', shutdown)
      void rebuild(viteOrigin)
    }
  }
}
