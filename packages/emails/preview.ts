import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { createInterface } from 'node:readline'

/**
 * `email preview` without the noise: jsx-email's own info logs are silenced (`DOT_LOG_LEVEL`),
 * and the lines its bundled preview app produces on every run are dropped — Vite's sourcemap
 * warnings for jsx-email's published files and the React unmount warnings Vite forwards from the
 * preview UI. Everything else (the URL, build errors) passes through.
 */
const noise = [
  /^Sourcemap for ".*jsx-email.*" points to missing source files$/,
  /\[console\.error\] Attempted to synchronously unmount a root/,
  /Re-optimizing dependencies because vite config has changed/,
  /^\s*$/
]

const tag = '\x1b[35m[emails]\x1b[0m'
const templates = (await readdir(new URL('templates', import.meta.url))).filter((file) =>
  file.endsWith('.tsx')
).length

console.log(`${tag} starting the preview server for ${templates} templates…`)

const child = spawn('email', ['preview', './templates', '--no-open', ...process.argv.slice(2)], {
  env: { ...process.env, DOT_LOG_LEVEL: process.env.DOT_LOG_LEVEL ?? 'warn', FORCE_COLOR: '1' },
  stdio: ['inherit', 'pipe', 'pipe']
})

// Colour codes would hide a match, so lines are tested without them.
const ansi = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')

for (const [stream, out] of [
  [child.stdout, process.stdout],
  [child.stderr, process.stderr]
] as const) {
  createInterface({ input: stream }).on('line', (line) => {
    const plain = line.replace(ansi, '')
    // The preview server's own URL line becomes one that says what it serves.
    const url = /Local:\s+(\S+)/.exec(plain)?.[1]
    if (url)
      out.write(
        `${tag} previewing ${templates} templates at \x1b[36m${url}\x1b[0m (reloads on save)\n`
      )
    else if (!noise.some((pattern) => pattern.test(plain))) out.write(`${line}\n`)
  })
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal))
}
// Stopped by Ctrl-C (forwarded above) is a normal end, not a failure for pnpm to report.
child.on('exit', (code, signal) => process.exit(signal ? 0 : (code ?? 0)))
