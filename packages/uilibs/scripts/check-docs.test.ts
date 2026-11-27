import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, it } from 'node:test'
import { fileURLToPath } from 'node:url'

// The checker reads source text and has no browser, so this runs under `node --test` (the `unit`
// project is browser mode and has no `fs`). Each case writes a small component folder to a temp
// tree and runs the real script over it.
const script = join(dirname(fileURLToPath(import.meta.url)), 'check-docs.ts')
const roots: string[] = []

function check(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'check-docs-'))
  roots.push(root)
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, name)), { recursive: true })
    writeFileSync(join(root, name), text)
  }
  const run = spawnSync(process.execPath, [script, root], { encoding: 'utf8' })
  return { status: run.status, output: run.stdout + run.stderr }
}

after(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

const page = (rows: string[]) => `# Widget

\`Widget\` is a fixture.

## API reference

### Widget

| Prop | Description |
| ---- | ----------- |
${rows.join('\n')}
`

const consistent = {
  'extra/widget/widget.component.tsx': `export interface WidgetProps {
  tone?: 'calm' | 'loud'
}

export function Widget({ tone }: WidgetProps) {
  return <span data-tone={tone} />
}
`,
  'extra/widget/widget.mdx': page(['| `tone` | `calm`, `loud` <br /> The mood. |']),
  'extra/widget/widget.stories.tsx': `export const Playground = {
  parameters: { controls: { include: ['tone'] } },
  argTypes: { tone: { control: 'radio' } },
  render: (args) => <Widget tone={args.tone} />
}
`
}

await it('passes a folder whose page and Playground match the code', () => {
  const { status, output } = check(consistent)
  assert.equal(status, 0, output)
  assert.match(output, /clean/)
})

await it('reports each way the page and the Playground drift from the code', () => {
  const { status, output } = check({
    // `dense` and `compact` are props of the code; `Gadget` is an exported part.
    'extra/widget/widget.component.tsx': `export interface WidgetProps {
tone?: 'calm' | 'loud'
dense?: boolean
compact?: boolean
}

export function Widget({ tone, dense, compact }: WidgetProps) {
return <span data-tone={tone} data-dense={dense} data-compact={compact} />
}

export function Gadget() {
return <span />
}
`,
    // No row for `dense`, and a row for `ghost`, which no source declares.
    'extra/widget/widget.mdx': page([
      '| `tone` | `calm`, `loud` <br /> The mood. |',
      '| `compact` | `boolean` <br /> Tighter. |',
      '| `ghost` | `Ghost` <br /> Removed from the code. |'
    ]),
    // `dense` and `size` are listed and never read, `size` and `hidden` have no counterpart in
    // `include` or `argTypes`, and `compact` is a documented scalar that `include` omits.
    'extra/widget/widget.stories.tsx': `export const Playground = {
parameters: { controls: { include: ['tone', 'dense', 'size'] } },
argTypes: {
  tone: { control: 'radio' },
  dense: { control: 'boolean' },
  hidden: { control: 'text' }
},
render: (args) => <Widget tone={args.tone} />
}
`
  })
  assert.equal(status, 1)
  const reported = [
    'Widget: `dense` is a prop of the code with no row',
    'Widget: row `ghost` is in no source of the folder',
    'Gadget: an exported component the page never names',
    'Playground: `dense` is listed in `include` but `render` never reads it',
    'Playground: `size` is listed in `include` but `render` never reads it',
    'Playground: `size` has no `argTypes` or `args` entry',
    'Playground: `argTypes.hidden` is defined but `include` does not list it',
    'Playground: `Widget` documents `compact` and `include` does not offer it'
  ]
  for (const finding of reported)
    assert.ok(output.includes(finding), `missing: ${finding}\n${output}`)
  // The prop that is documented, read, and controlled is not reported.
  assert.doesNotMatch(output, /`tone`/)
  assert.match(output, /8 finding\(s\)/)
})
