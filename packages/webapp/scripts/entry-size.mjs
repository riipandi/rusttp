// Fails when the entry load of the built SPA passes its budget: the entry chunk plus every chunk
// it imports statically, and the stylesheets those chunks name, which is what a first visit
// downloads before anything renders (the sheet blocks rendering). Reads the
// manifest `vite build` writes (`pnpm --filter webapp build` first). Raise a limit on purpose, with
// the reason in the commit, never to make a failing build pass.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

// Measured after the tooltip left the root provider (plan 00005, phase 2): 458 KB raw, 146 KB gzip,
// plus about 5%. The CSS limits are the minified production sheet after the responsive cut and the
// single responsive stylesheet (plan 00014, phase 46: 66.9 KB raw, 17.9 KB gzip) plus about 5%.
const limits = { rawKB: 480, gzipKB: 152, cssRawKB: 70.5, cssGzipKB: 18.8 }

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../apps/server/frontend')
const manifest = JSON.parse(readFileSync(resolve(outDir, '.vite/manifest.json'), 'utf8'))

const entry = Object.keys(manifest).find((key) => manifest[key].isEntry)
if (!entry) throw new Error('No entry in the manifest.')

const seen = new Set()
const styles = new Set()
const walk = (key) => {
  if (seen.has(key)) return
  seen.add(key)
  for (const css of manifest[key].css ?? []) styles.add(css)
  for (const imported of manifest[key].imports ?? []) walk(imported)
}
walk(entry)

let raw = 0
let gzip = 0
for (const key of [...seen].toSorted((a, b) => a.localeCompare(b))) {
  const bytes = readFileSync(resolve(outDir, manifest[key].file))
  const zipped = gzipSync(bytes, { level: 9 }).length
  raw += bytes.length
  gzip += zipped
  console.info(
    `${(bytes.length / 1000).toFixed(1).padStart(8)} KB ${(zipped / 1000).toFixed(1).padStart(7)} KB gz  ${manifest[key].file}`
  )
}

let cssRaw = 0
let cssGzip = 0
for (const file of [...styles].toSorted((a, b) => a.localeCompare(b))) {
  const bytes = readFileSync(resolve(outDir, file))
  const zipped = gzipSync(bytes, { level: 9 }).length
  cssRaw += bytes.length
  cssGzip += zipped
  console.info(
    `${(bytes.length / 1000).toFixed(1).padStart(8)} KB ${(zipped / 1000).toFixed(1).padStart(7)} KB gz  ${file}`
  )
}

const rawKB = raw / 1000
const gzipKB = gzip / 1000
const cssRawKB = cssRaw / 1000
const cssGzipKB = cssGzip / 1000
console.info(
  `entry load: ${rawKB.toFixed(1)} KB (limit ${limits.rawKB}), ${gzipKB.toFixed(1)} KB gzip (limit ${limits.gzipKB}), ${seen.size} chunks`
)
console.info(
  `entry css: ${cssRawKB.toFixed(1)} KB (limit ${limits.cssRawKB}), ${cssGzipKB.toFixed(1)} KB gzip (limit ${limits.cssGzipKB}), ${styles.size} files`
)
if (rawKB > limits.rawKB || gzipKB > limits.gzipKB) {
  console.error('The entry load is over its budget.')
  process.exit(1)
}
if (cssRawKB > limits.cssRawKB || cssGzipKB > limits.cssGzipKB) {
  console.error('The entry CSS is over its budget.')
  process.exit(1)
}
