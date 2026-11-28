import { readFileSync, statSync } from 'node:fs'
/**
 * Opens every docs page of a built Storybook in Chromium, so a docs page that cannot render
 * fails a gate and not a reader. Run it after `pnpm --filter uilibs storybook:build` with
 * `pnpm --filter uilibs check:docs:render [dir]` (CI runs it in `.github/workflows/uilibs.yml`);
 * `dir` defaults to `apps/server/storybook`, the build the server embeds.
 *
 * The story gate (`vitest`) never opens a docs page, which is how a Docs page that embedded a
 * story missing from a cached story index shipped unnoticed. This script reads `index.json` from
 * the build, serves the folder, and checks:
 *   - every `docs` entry is named `Docs` (one name, so a link is `?path=/docs/<component>--docs`);
 *   - every docs page renders: no Storybook error display, no "Invalid value passed to the 'of'
 *     prop" (a `Canvas` or `Story` block pointing at a story the index does not have), no console
 *     error, and no uncaught exception;
 *   - the toolbar's theme reaches the docs content in the manager, under a dark and a light OS: the
 *     docs background follows Light, Dark, and System after each other (a regression of
 *     `.storybook/docs-container.tsx`, which once restarted on the previous value after System).
 *
 * Playwright is already a devDependency (the story gate drives it); nothing is added.
 */
import { createServer } from 'node:http'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(process.argv[2] ?? join(here, '../../../apps/server/storybook'))

/** The text Storybook shows for a block whose story id is not in the story index. */
const OF_ERROR = "Invalid value passed to the 'of' prop"
/** A page with inline stories, so the theme reaches stories and prose alike. */
const THEME_PAGE = 'base-components-button--docs'
/** Pages rendered at once; each is one Chromium page, so this is memory, not correctness. */
const CONCURRENCY = 4

interface IndexEntry {
  id: string
  type: string
  name: string
}

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
}

function readIndex(): IndexEntry[] {
  const index: unknown = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'))
  const entries: unknown =
    typeof index === 'object' && index !== null ? Reflect.get(index, 'entries') : undefined
  if (typeof entries !== 'object' || entries === null) throw new Error('index.json has no entries')
  return Object.values(entries).filter(
    (entry): entry is IndexEntry =>
      typeof entry === 'object' && entry !== null && Reflect.get(entry, 'type') === 'docs'
  )
}

/** A static server over the build: Storybook's own files, no cache, nothing outside `root`. */
function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
    const file = resolve(root, `.${path === '/' ? '/index.html' : path}`)
    try {
      if (!file.startsWith(root + sep) || !statSync(file).isFile()) throw new Error('not a file')
      res.writeHead(200, {
        'content-type': types[extname(file)] ?? 'application/octet-stream',
        'cache-control': 'no-cache'
      })
      res.end(readFileSync(file))
    } catch {
      res.writeHead(404)
      res.end()
    }
  })
  return new Promise<{ url: string; close: () => void }>((done) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (typeof address !== 'object' || address === null) throw new Error('no address')
      done({ url: `http://127.0.0.1:${address.port}`, close: () => server.close() })
    })
  })
}

/** `rgb(…)`, `rgba(…)`, or `oklch(…)` as seen by `getComputedStyle`; only the lightness matters. */
function isDark(color: string): boolean {
  const oklch = /^oklch\(\s*([\d.]+)/.exec(color)
  if (oklch) return Number(oklch[1]) < 0.5
  const channels = color
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number)
  if (!channels || channels.length < 3) throw new Error(`Unreadable color: ${color}`)
  return channels.reduce((sum, channel) => sum + channel, 0) / 3 < 128
}

/** A multi-line error (a stack, a Playwright call log) is one line in the report. */
const firstLine = (text: string) => text.split('\n')[0] ?? text

/** Opens one docs page on its own and lists what is wrong with it. */
async function renderProblems(browser: Browser, base: string, id: string): Promise<string[]> {
  const problems: string[] = []
  const page = await browser.newPage()
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console error: ${firstLine(message.text())}`)
  })
  page.on('pageerror', (error) => problems.push(`uncaught: ${firstLine(error.message)}`))
  try {
    await page.goto(`${base}/iframe.html?id=${id}&viewMode=docs`, { waitUntil: 'load' })
    // Storybook marks the body when it shows the docs, an error, or "No Preview".
    await page.waitForSelector(
      'body.sb-show-main, body.sb-show-errordisplay, body.sb-show-nopreview',
      { timeout: 30_000 }
    )
    // Blocks render after the page frame; the stories on it settle with the network.
    await page.locator('.sbdocs').first().waitFor({ timeout: 30_000 })
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').innerText()
    if (body.includes(OF_ERROR)) problems.push(OF_ERROR)
    const failed = await page.evaluate(() =>
      ['sb-show-errordisplay', 'sb-show-nopreview'].find((name) =>
        document.body.classList.contains(name)
      )
    )
    if (failed) problems.push(`Storybook shows ${failed}`)
  } catch (error) {
    problems.push(firstLine(error instanceof Error ? error.message : String(error)))
  } finally {
    await page.close()
  }
  return problems
}

/** The docs background as the reader sees it: the `.sbdocs` article inside the preview frame. */
async function docsIsDark(page: Page): Promise<boolean> {
  const frame = page.frameLocator('#storybook-preview-iframe')
  const color = await frame
    .locator('.sbdocs')
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  return isDark(color)
}

/** Picks a toolbar theme in the manager and waits for the docs to settle on it. */
async function pickTheme(page: Page, name: 'Light' | 'Dark' | 'System') {
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /Global theme/i }).click()
  await page.getByRole('option', { name, exact: true }).click()
  await page.waitForTimeout(1500)
}

/** Light, Dark, and System after each other under one OS scheme: every one must reach the docs. */
async function themeProblems(browser: Browser, base: string, os: 'dark' | 'light') {
  const problems: string[] = []
  const context = await browser.newContext({
    colorScheme: os,
    viewport: { width: 1280, height: 800 }
  })
  const page = await context.newPage()
  try {
    await page.goto(`${base}/?path=/docs/${THEME_PAGE}`, { waitUntil: 'load' })
    await page.locator('#storybook-preview-iframe').waitFor()
    await page.frameLocator('#storybook-preview-iframe').locator('.sbdocs').first().waitFor()
    // System after Dark and after Light is the case that once kept the previous value.
    const steps = [
      ['Dark', true],
      ['Light', false],
      ['System', os === 'dark'],
      ['Dark', true],
      ['System', os === 'dark']
    ] as const
    for (const [name, dark] of steps) {
      await pickTheme(page, name)
      const got = await docsIsDark(page)
      if (got !== dark) {
        problems.push(
          `theme ${name} under a ${os} OS: the docs are ${got ? 'dark' : 'light'}, expected ${dark ? 'dark' : 'light'}`
        )
      }
    }
  } catch (error) {
    problems.push(
      `theme under a ${os} OS: ${firstLine(error instanceof Error ? error.message : String(error))}`
    )
  } finally {
    await context.close()
  }
  return problems
}

const docs = readIndex()
if (docs.length === 0) {
  console.error(`No docs entries in ${join(root, 'index.json')}; build Storybook first.`)
  process.exit(1)
}
if (!docs.some((entry) => entry.id === THEME_PAGE)) {
  console.error(`The theme check needs ${THEME_PAGE}, which the index does not have.`)
  process.exit(1)
}

const failures: string[] = []
for (const entry of docs) {
  if (entry.name !== 'Docs') failures.push(`${entry.id}: named "${entry.name}", not "Docs"`)
}

const server = await serve()
const browser = await chromium.launch()
try {
  const queue = [...docs]
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let entry = queue.shift(); entry; entry = queue.shift()) {
        for (const problem of new Set(await renderProblems(browser, server.url, entry.id))) {
          failures.push(`${entry.id}: ${problem}`)
        }
      }
    })
  )
  for (const os of ['dark', 'light'] as const) {
    failures.push(...(await themeProblems(browser, server.url, os)))
  }
} finally {
  await browser.close()
  server.close()
}

if (failures.length > 0) {
  for (const failure of failures.toSorted()) console.error(failure)
  console.error(`\n${failures.length} problem(s) over ${docs.length} docs entries.`)
  process.exit(1)
}
console.log(
  `Docs render: ${docs.length} of ${docs.length} docs entries render, all named Docs; the theme reaches the docs under a dark and a light OS.`
)
