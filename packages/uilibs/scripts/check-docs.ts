/**
 * Checks the component docs pages and the Playground stories against the code, so the two stay
 * in step by a gate and not by convention. Run it with `just check-ui-docs` (CI runs it too).
 * It reads source text only: no new dependency, no type information, so each rule below is
 * deliberately narrow, and the places it cannot decide are listed in `known` with a reason.
 *
 * Docs pages (`<name>.mdx`, the `### Part` sections under `## API reference`):
 *   - undocumented: a prop the part declares itself (its `<Part>Props` object literal, or a name
 *     its function destructures) has no row in the part's `Prop` table;
 *   - stale: a `Prop` row names something that is in none of the folder's sources, unless the
 *     row says it comes from Base UI (a pass-through the library never reads);
 *   - unnamed part: an exported component the page never mentions.
 *
 * Playgrounds (`export const Playground`, its `controls.include`):
 *   - dead control: an `include` name that `render` never reads (neither named, nor forwarded
 *     through `...args` or a `...rest` it passes on);
 *   - no control: an `include` name without an `argTypes` or `args` entry;
 *   - hidden control: an `argTypes` entry that `include` does not list;
 *   - gap: a part the Playground renders has a documented scalar prop (`boolean`, `number`,
 *     `string`, or a list of values) or a glyph prop that `include` does not offer. Callbacks,
 *     `labels`, `style`, `render`, and other slots are never controls (plan-00010 D3).
 *
 * `known` holds the findings that stay open on purpose. An entry that no longer matches a finding
 * fails the run, so the list cannot rot.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

interface Known {
  /** A finding, as the checker prints it, without the file. */
  finding: string
  /** Where it applies: a `src`-relative path. */
  file: string
  reason: string
}

const known: Known[] = [
  {
    file: 'base/separator/separator.stories.tsx',
    finding: 'Playground: `Separator` documents `orientation` and `include` does not offer it',
    reason: 'The Playground draws both orientations at once; the `Orientations` story is the axis.'
  },
  {
    file: 'extra/input-password/input-password.stories.tsx',
    finding: 'Playground: `InputPassword` documents `visible` and `include` does not offer it',
    reason: '`visible` is the controlled twin of `defaultVisible`, which the Playground offers.'
  },
  {
    file: 'extra/pagination/pagination.stories.tsx',
    finding: 'Playground: `PaginationLink` documents `current` and `include` does not offer it',
    reason: "The Playground's `page` control sets `current` on the matching link."
  },
  {
    file: 'data-grid/stories/data-grid-playground.stories.tsx',
    finding:
      'Playground: `tableLayout` documents `columnsDraggable` and `include` does not offer it',
    reason:
      'It only works under `DataGridTableDnd`, a different composition; the columns stories show it.'
  },
  {
    file: 'data-grid/stories/data-grid-playground.stories.tsx',
    finding: 'Playground: `tableLayout` documents `rowsPinnable` and `include` does not offer it',
    reason: 'It needs a pin button column and the pinning state; the rows stories show it.'
  }
]

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')

// ---------------------------------------------------------------------------------------------
// Source text helpers
// ---------------------------------------------------------------------------------------------

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  )
}

const read = (file: string) => readFileSync(file, 'utf8')

const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')

// Angle brackets are not tracked: a comparison in a story's code string would unbalance them.
const OPEN = '{(['
const CLOSE = '})]'

/** The index just past the template literal that opens at `open` (it may hold `${}` and brackets). */
function skipTemplate(source: string, open: number): number {
  for (let i = open + 1; i < source.length; i++) {
    if (source[i] === '\\') i++
    else if (source[i] === '`') return i
  }
  return source.length - 1
}

/** The index of the bracket that closes the one at `open`. */
function closing(source: string, open: number): number {
  let depth = 0
  for (let i = open; i < source.length; i++) {
    const c = source[i]!
    if (c === '`') i = skipTemplate(source, i)
    else if (OPEN.includes(c)) depth++
    else if (CLOSE.includes(c) && --depth === 0) return i
  }
  return source.length - 1
}

/** The top-level pieces of `text`, split on `separators` where no bracket is open. */
function topLevel(text: string, separators: string): string[] {
  const pieces: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (c === '`') i = skipTemplate(text, i)
    else if (OPEN.includes(c)) depth++
    else if (CLOSE.includes(c)) depth--
    else if (depth === 0 && separators.includes(c)) {
      pieces.push(text.slice(start, i))
      start = i + 1
    }
  }
  pieces.push(text.slice(start))
  return pieces
}

const wordIn = (name: string, text: string) =>
  new RegExp(`(?<![\\w$-])${name.replace(/[$]/g, '\\$')}(?![\\w$-])`).test(text)

// ---------------------------------------------------------------------------------------------
// Docs pages
// ---------------------------------------------------------------------------------------------

interface Row {
  name: string
  /** The cell's first line: the values or the type. */
  type: string
  description: string
}

interface Section {
  head: string
  rows: Row[]
  /** The part whose props this one takes (\"Takes the same props as `X`\"), or `true` for another library's (\"Takes the props of\"). */
  inherits?: string | true
}

/** The `### Part` sections under `## API reference`, with the rows of their `Prop` tables. */
function sectionsOf(page: string): Section[] {
  const start = page.indexOf('## API reference')
  if (start < 0) return []
  const lines = page.slice(start).split('\n').slice(1)
  const sections: Section[] = []
  let current: Section | undefined
  let inPropTable = false
  for (const line of lines) {
    const heading = /^### (.+)$/.exec(line)
    if (heading) {
      current = { head: heading[1]!.trim(), rows: [] }
      sections.push(current)
      inPropTable = false
      continue
    }
    if (/^##? /.test(line) && !line.startsWith('###')) break
    if (!current) continue
    const same = /Takes the same props as `([A-Za-z0-9]+)`/.exec(line)?.[1]
    if (same) current.inherits = same
    else if (/Takes the props of/.test(line)) current.inherits = true
    if (/^\|\s*(Prop|Key)\s*\|/.test(line)) {
      inPropTable = true
      continue
    }
    if (!line.startsWith('|')) {
      inPropTable = false
      continue
    }
    if (!inPropTable || /^\|[-\s|]+\|$/.test(line)) continue
    const cells = /^\|\s*`([^`|]+)`\s*\|\s*(.*?)\s*\|\s*$/.exec(line)
    if (!cells) continue
    const [type = '', ...rest] = cells[2]!.split(/\s*<br \/>\s*/)
    current.rows.push({ name: cells[1]!, type: type.trim(), description: rest.join(' ') })
  }
  for (const section of sections) {
    if (typeof section.inherits !== 'string') continue
    const parent = sections.find((entry) => entry.head === section.inherits)
    if (parent) section.rows = parent.rows
  }
  return sections
}

const isIdentifier = (text: string) => /^[A-Z][A-Za-z0-9]*$/.test(text)

/** A documented prop the type column shows as one value to pick: a boolean, a number, a string, or a list of values. */
function isScalar(type: string): boolean {
  if (/^`(boolean|number|string|Date)`$/.test(type)) return true
  // A list needs two or more plain values: a lone token is a type name (`Date`, `string[]`).
  const values = type.split(/,\s*|\s+or\s+/).filter(Boolean)
  return (
    values.length > 1 && values.every((value) => /^`[a-z0-9][A-Za-z0-9.-]*`$/.test(value.trim()))
  )
}

const isGlyph = (type: string) => /^(glyph component|`(ComponentType|Glyph)\b)/.test(type)

// ---------------------------------------------------------------------------------------------
// Props a part declares itself
// ---------------------------------------------------------------------------------------------

const memberName = /^\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:/

/** The names declared at the top level of the object literal that opens at `open`. */
function literalMembers(source: string, open: number): string[] {
  const body = source.slice(open + 1, closing(source, open))
  return topLevel(body, ';\n').flatMap((piece) => {
    const match = memberName.exec(piece)
    return match ? [match[1]!] : []
  })
}

/** The names a `<Part>Props` interface or type declares in its own literals (not what it extends). */
function declaredProps(source: string, part: string): string[] {
  const declaration = new RegExp(`export (?:interface|type) ${part}Props\\b`).exec(source)
  if (!declaration) return []
  const rest = source.slice(declaration.index)
  const end = rest.slice(1).search(/\n(?:export|const|function|type|interface|\/\*\*)\s/)
  const chunk = end < 0 ? rest : rest.slice(0, end + 1)
  const names: string[] = []
  for (
    let i =
      chunk.indexOf('=') >= 0 && !chunk.startsWith('export interface') ? 0 : chunk.indexOf('{');
    i >= 0 && i < chunk.length;
    i++
  ) {
    if (chunk[i] !== '{') continue
    names.push(...literalMembers(chunk, i))
    i = closing(chunk, i)
    // Only the first literal of an interface; every top-level literal of a type.
    if (chunk.startsWith('export interface')) break
  }
  return names
}

/** The names the component function destructures from its props, without the rest element. */
function destructuredProps(source: string, part: string, defaultsOnly = false): string[] {
  const signature = new RegExp(
    `(?:function ${part}\\s*(?:<[^(]*>)?\\(|const ${part}\\s*=\\s*(?:<[^(]*>)?\\()\\s*\\{`
  ).exec(source)
  if (!signature) return []
  const open = signature.index + signature[0].length - 1
  const body = source.slice(open + 1, closing(source, open))
  return topLevel(body, ',').flatMap((entry) => {
    const text = entry.trim()
    if (!text || text.startsWith('...')) return []
    if (defaultsOnly && !/^[A-Za-z_$][\w$]*\s*=[^=]/.test(text)) return []
    const match = /^([A-Za-z_$][\w$]*)/.exec(text)
    return match ? [match[1]!] : []
  })
}

/** What no table has to list: styling and structure every part shares. */
const sharedProps = new Set(['children', 'style', 'ref', 'className', 'key', 'render'])

// ---------------------------------------------------------------------------------------------
// Playgrounds
// ---------------------------------------------------------------------------------------------

interface Playground {
  file: string
  include: string[]
  argTypes: string[]
  args: string[]
  render: string
}

function storyBody(source: string, name: string): string | undefined {
  const declaration = new RegExp(`export const ${name}\\b[^=]*=\\s*\\{`).exec(source)
  if (!declaration) return undefined
  const open = declaration.index + declaration[0].length - 1
  return source.slice(open, closing(source, open) + 1)
}

/** The keys of the object literal assigned to `key` at the top level of a story body. */
function keysOf(body: string, key: string): string[] {
  const inner = body.slice(1, -1)
  for (const piece of topLevel(inner, ',')) {
    const match = new RegExp(`^\\s*${key}\\s*:\\s*\\{`).exec(piece)
    if (!match) continue
    const open = piece.indexOf('{', match.index)
    const literal = piece.slice(open + 1, closing(piece, open))
    return topLevel(literal, ',').flatMap((entry) => {
      const name = /^\s*['"]?([\w$-]+)['"]?\s*:/.exec(entry)
      return name ? [name[1]!] : []
    })
  }
  return []
}

function includeOf(body: string): string[] {
  const match = /include:\s*\[([\s\S]*?)\]/.exec(body)
  return match ? [...match[1]!.matchAll(/'([^']+)'/g)].map((entry) => entry[1]!) : []
}

/** The `render` property of a story body, up to the next top-level property. */
function renderOf(body: string): string {
  for (const piece of topLevel(body.slice(1, -1), ',')) {
    if (/^\s*render\s*:/.test(piece)) return piece
  }
  return ''
}

function playgroundOf(file: string): Playground | undefined {
  const body = storyBody(stripComments(read(file)), 'Playground')
  if (!body) return undefined
  return {
    file: relative(srcDir, file),
    include: includeOf(body),
    argTypes: keysOf(body, 'argTypes'),
    args: keysOf(body, 'args'),
    render: renderOf(body)
  }
}

/** Whether a Playground's `render` reads the arg `name`: by name, or through a `...rest` it forwards. */
function readsArg(render: string, name: string): boolean {
  if (wordIn(name, render)) return true
  if (/\{\s*\.\.\.args\s*\}/.test(render)) return true
  const rest = /\.\.\.([A-Za-z_$][\w$]*)\s*\}\s*\)\s*=>/.exec(render)?.[1]
  return rest !== undefined && render.split(rest).length > 2
}

// ---------------------------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------------------------

const findings: { file: string; finding: string }[] = []
const report = (file: string, finding: string) => findings.push({ file, finding })

const files = walk(srcDir)
const pages = files.filter((file) => file.endsWith('.mdx'))
const stories = files.filter((file) => file.endsWith('.stories.tsx'))

/** A scalar or glyph row is a gap in a Playground when it is not offered; the rows that are never controls are skipped. */
const neverControl = (name: string) =>
  sharedProps.has(name) ||
  name === 'labels' ||
  name === 'i18n' ||
  name === 'name' ||
  name === 'id' ||
  /^on[A-Z]/.test(name)

for (const page of pages) {
  const folder = dirname(page)
  const sources = readdirSync(folder)
    .filter((name) => /\.tsx?$/.test(name) && !/\.(stories|stylex|test)\./.test(name))
    .map((name) => ({ name, text: stripComments(read(join(folder, name))) }))
  // A row may name a prop the part takes from a sibling component it extends (a `LoaderText` is a
  // `Text`), so the sources of the folders it imports by a relative path count too.
  const imported = sources.flatMap((source) =>
    [...source.text.matchAll(/from '(\.\.?\/[^']+)'/g)].flatMap((match) => {
      const target = join(folder, match[1]!)
      try {
        return readdirSync(target)
          .filter((name) => /\.tsx?$/.test(name) && !/\.(stories|stylex|test)\./.test(name))
          .map((name) => stripComments(read(join(target, name))))
      } catch {
        return []
      }
    })
  )
  const code = [...sources.map((source) => source.text), ...imported].join('\n')
  const text = read(page)
  const folderPages = pages.filter((other) => dirname(other) === folder).map(read)
  const sections = sectionsOf(text)
  const rel = relative(srcDir, page)

  for (const section of sections.filter((entry) => isIdentifier(entry.head))) {
    // A `<Part>Props` interface says what the part adds; the rest it destructures is inherited and
    // only routed. Without one, the props it destructures are the ones it handles itself.
    const declared = sources.flatMap((source) => declaredProps(source.text, section.head))
    // A destructured prop with a default is the part's own behavior even when an interface exists.
    const destructured = sources.flatMap((source) =>
      destructuredProps(source.text, section.head, declared.length > 0)
    )
    const own = new Set([...declared, ...destructured])
    const documented = new Set(section.rows.map((row) => row.name))
    // A section that takes another part's or library's props lists what it adds, not what it takes.
    if (section.inherits === true) continue
    for (const name of own) {
      if (sharedProps.has(name) || documented.has(name)) continue
      report(rel, `${section.head}: \`${name}\` is a prop of the code with no row`)
    }
    for (const row of section.rows) {
      if (/^data-|^aria-|^--/.test(row.name) || wordIn(row.name, code)) continue
      if (/Base UI/.test(row.type + row.description)) continue
      report(rel, `${section.head}: row \`${row.name}\` is in no source of the folder`)
    }
  }

  const exported = sources
    .filter((source) => source.name.endsWith('.component.tsx'))
    .flatMap((source) =>
      [
        ...source.text.matchAll(
          /^export (?:function ([A-Z][A-Za-z0-9]*)\b|const ([A-Z][A-Za-z0-9]*)\s*=\s*(?:async\s*)?\()/gm
        )
      ].map((match) => (match[1] ?? match[2])!)
    )
  for (const name of exported) {
    if (!folderPages.some((candidate) => wordIn(name, candidate))) {
      report(rel, `${name}: an exported component the page never names`)
    }
  }
}

for (const file of stories) {
  const playground = playgroundOf(file)
  if (!playground) continue
  for (const name of playground.include) {
    if (!readsArg(playground.render, name))
      report(
        playground.file,
        `Playground: \`${name}\` is listed in \`include\` but \`render\` never reads it`
      )
    if (!playground.argTypes.includes(name) && !playground.args.includes(name)) {
      report(playground.file, `Playground: \`${name}\` has no \`argTypes\` or \`args\` entry`)
    }
  }
  for (const name of playground.argTypes) {
    if (!playground.include.includes(name))
      report(
        playground.file,
        `Playground: \`argTypes.${name}\` is defined but \`include\` does not list it`
      )
  }

  // Chart Playgrounds control the chart's options, not component props (plan-00010 D7).
  if (playground.file.startsWith('charts/')) continue
  // A folder can hold several pages (Badge and BadgeAnchor); the data grid's stories sit one level down.
  const owners = pages.filter(
    (candidate) =>
      dirname(candidate) === dirname(file) ||
      (dirname(candidate) === dirname(dirname(file)) && file.includes('/stories/'))
  )
  for (const section of owners.flatMap((owner) => sectionsOf(read(owner)))) {
    const rendered = isIdentifier(section.head)
      ? new RegExp(`<${section.head}[\\s/>]`).test(playground.render)
      : section.head === 'tableLayout' && playground.file.includes('playground')
    if (!rendered) continue
    for (const row of section.rows) {
      if (neverControl(row.name) || playground.include.includes(row.name)) continue
      if (isScalar(row.type) || isGlyph(row.type)) {
        report(
          playground.file,
          `Playground: \`${section.head}\` documents \`${row.name}\` and \`include\` does not offer it`
        )
      }
    }
  }
}

const open = findings.filter(
  (entry) => !known.some((item) => item.file === entry.file && item.finding === entry.finding)
)
const stale = known.filter(
  (item) => !findings.some((entry) => entry.file === item.file && entry.finding === item.finding)
)

for (const entry of open) console.error(`${entry.file}: ${entry.finding}`)
for (const item of stale) console.error(`${item.file}: stale entry in \`known\`: ${item.finding}`)

if (open.length > 0 || stale.length > 0) {
  console.error(`\n${open.length} finding(s), ${stale.length} stale exemption(s).`)
  process.exit(1)
}
console.log(
  `Docs check: ${pages.length} pages, ${stories.length} story files, ${known.length} known exception(s), clean.`
)
