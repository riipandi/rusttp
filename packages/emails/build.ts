import { render } from 'jsx-email'
import { compile } from 'jsx-email/compile'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement, type FunctionComponent } from 'react'

/**
 * Renders every template in `templates/` into the files the server embeds:
 * `apps/server/emails/<name>.html` and `<name>.txt`, with Jinja-style `{{ … }}` placeholders
 * (each template's `templateProps`) left for the server to fill at send time.
 *
 * jsx-email's `compile` bundles the TSX with esbuild first, so this script runs on plain Node.
 */

interface TemplateModule {
  templateName: string
  templateProps: Record<string, unknown>
  Template: FunctionComponent<Record<string, unknown>>
}

process.env.NODE_ENV = 'production'

// `--verbose` lists every template; by default only failures and the summary print.
const verbose = process.argv.includes('--verbose')
const tag = '\x1b[35m[emails]\x1b[0m'
const red = (text: string) => `\x1b[31m${text}\x1b[0m`
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

const root = resolve(import.meta.dirname, '../..')
const templatesDir = resolve(import.meta.dirname, 'templates')
const compiledDir = resolve(import.meta.dirname, '.compiled')
const outputDir = resolve(root, 'apps/server/emails')

// Passing `selectors` replaces jsx-email's defaults, so they are restated here. Headings keep their
// case: html-to-text upper-cases them by default, `{{ placeholders }}` included.
const plainText = {
  // Long lines are fine in text mail, and wrapping could split a `{% … %}` tag.
  wordwrap: false as const,
  selectors: [
    { selector: 'img', format: 'skip' },
    { selector: '[data-skip="true"]', format: 'skip' },
    { selector: 'a', options: { linkBrackets: false, hideLinkHrefIfSameAsText: true } },
    { selector: 'jsx-email-raw', format: 'raw', options: {} },
    ...['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((selector) => ({
      selector,
      options: { uppercase: false }
    }))
  ]
}

function isTemplateModule(
  mod: Record<string, unknown>
): mod is Record<string, unknown> & TemplateModule {
  return (
    typeof mod.templateName === 'string' &&
    typeof mod.Template === 'function' &&
    typeof mod.templateProps === 'object' &&
    mod.templateProps !== null
  )
}

const started = performance.now()
const files = (await readdir(templatesDir))
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => join(templatesDir, file))
console.log(`${tag} rendering ${files.length} templates…`)

await rm(compiledDir, { recursive: true, force: true })
const compiled = await compile({ files, hashFiles: false, outDir: compiledDir })
// `compile` emits CommonJS `.js`, which this `"type": "module"` package would load as ESM.
await writeFile(join(compiledDir, 'package.json'), '{ "type": "commonjs" }\n')

// The output directory holds generated files only; clearing it drops templates that were removed.
await rm(outputDir, { recursive: true, force: true })
await mkdir(outputDir, { recursive: true })

let failed = 0
for (const { path, entryPoint } of compiled) {
  const source = relative(root, entryPoint)
  try {
    const mod: Record<string, unknown> = await import(pathToFileURL(path).href)
    if (!isTemplateModule(mod)) {
      throw new Error('expected `templateName`, `templateProps`, and `Template` exports')
    }
    const element = createElement(mod.Template, mod.templateProps)
    const html = await render(element)
    const text = await render(element, { plainText })
    await writeFile(join(outputDir, `${mod.templateName}.html`), html)
    await writeFile(join(outputDir, `${mod.templateName}.txt`), text)
    if (verbose) console.log(`${tag} rendered ${mod.templateName}`)
  } catch (error) {
    failed++
    console.error(
      `${tag} ${red('✗')} ${source}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

await rm(compiledDir, { recursive: true, force: true })

const elapsed = seconds(performance.now() - started)
const target = relative(root, outputDir)
if (failed > 0) {
  console.error(
    `${tag} ${red(`${failed} of ${compiled.length} templates failed`)}; the other ${compiled.length - failed} are in ${target} (${elapsed})`
  )
  process.exit(1)
}
console.log(`${tag} rendered ${compiled.length} templates → ${target} (html + text) in ${elapsed}`)
