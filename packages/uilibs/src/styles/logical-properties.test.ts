import { describe, expect, it } from 'vitest'

// Side-placed parts name a physical side by their API (`side='left'`), and the data grid copies the
// focused cell's computed padding onto its editor, so these files hold physical properties on purpose.
const physical = ['base/drawer/drawer', 'extra/sheet/sheet', 'data-grid/data-grid']

const sources = import.meta.glob<string>('../**/*.stylex.ts', {
  eager: true,
  import: 'default',
  query: '?raw'
})

const physicalProperty =
  /^\s*(margin(Left|Right)|padding(Left|Right)|border(Left|Right)(Width|Color|Style)|border(Top|Bottom)(Left|Right)Radius|textAlign: '(left|right)')\b/m

describe('stylesheets', () => {
  it('lay content out with logical properties, so it follows `dir`', () => {
    const offenders = Object.entries(sources)
      .map(([path, text]) => [path.slice(3).replace(/\.stylex\.ts$/, ''), text] as const)
      .filter(([file]) => !physical.includes(file))
      .filter(([, text]) => physicalProperty.test(text))
      .map(([file]) => file)
    expect(Object.keys(sources).length).toBeGreaterThan(40)
    expect(offenders).toEqual([])
  })
})
