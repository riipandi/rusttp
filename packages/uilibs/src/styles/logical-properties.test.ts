import { describe, expect, it } from 'vitest'

// Side-placed parts name a physical side by their API (`side='left'`), the data grid copies the
// focused cell's computed padding onto its editor, and a toast keeps the screen side its `position`
// names, so these files hold physical properties on purpose.
const physicalFiles = [
  'base/drawer/drawer',
  'extra/sheet/sheet',
  'data-grid/data-grid',
  'base/toast/toast'
]

// Every other physical line is listed here, exactly, as `<file>: <trimmed line>`. A new physical side
// fails the test until it is added with a reason; a line that no longer exists fails it too.
const physicalLines = [
  // Centered with `translate(-50%)`, so `left` is the middle in both directions.
  "data-grid/data-grid-table: left: '50%',",
  "extra/resizable/resizable: left: '50%',",
  // Stretched to both edges, the same in both directions.
  'extra/resizable/resizable: left: 0,',
  'extra/resizable/resizable: right: 0,',
  // The data grid's column resize indicator sits on the edge the pointer is dragging.
  'data-grid/data-grid-table: left: 0,',
  'data-grid/data-grid-table: left: 0,',
  // The arrow follows `data-side`, which is a physical side.
  'base/tooltip/tooltip: left: {',
  'base/tooltip/tooltip: right: {'
]

const sources = import.meta.glob<string>('../**/*.stylex.ts', {
  eager: true,
  import: 'default',
  query: '?raw'
})

const physicalProperty =
  /^\s*(?:(?:left|right|margin(?:Left|Right)|padding(?:Left|Right)|scrollMargin(?:Left|Right)|scrollPadding(?:Left|Right)|border(?:Left|Right)(?:Width|Color|Style)?|border(?:Top|Bottom)(?:Left|Right)Radius):|(?:float|textAlign): '(?:left|right)')/

describe('stylesheets', () => {
  it('lay content out with logical properties, so it follows `dir`', () => {
    const offenders = Object.entries(sources)
      .map(
        ([path, text]) =>
          [path.replace(/^\.{1,2}\//, '').replace(/\.stylex\.ts$/, ''), text] as const
      )
      .filter(([file]) => !physicalFiles.includes(file))
      .flatMap(([file, text]) =>
        text
          .split('\n')
          .filter((line) => physicalProperty.test(line))
          .map((line) => `${file}: ${line.trim()}`)
      )
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(80)
    expect(offenders.toSorted()).toEqual(physicalLines.toSorted())
  })
})
