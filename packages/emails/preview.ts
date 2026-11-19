import { spawn } from 'node:child_process'
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
    if (!noise.some((pattern) => pattern.test(plain))) out.write(`${line}\n`)
  })
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal))
}
// Stopped by Ctrl-C (forwarded above) is a normal end, not a failure for pnpm to report.
child.on('exit', (code, signal) => process.exit(signal ? 0 : (code ?? 0)))
