import { afterAll, describe, expect, it } from 'vitest'
import type { DataGridCellsChangeDetails, DataGridColumnCellEdit } from './data-grid'
import {
  getDataGridStepTarget,
  getDataGridWritableCellEdit,
  invertDataGridCellsChange,
  parseDataGridClipboardText,
  renderDataGridClipboardHtml,
  serializeDataGridClipboardText,
  tileDataGridClipboardBlock
} from './data-grid-cell-ops'
import { mountTestTable } from './test-table'

describe('parseDataGridClipboardText', () => {
  it.each([
    ['a tab-separated row', 'a\tb', [['a', 'b']]],
    [
      'LF rows',
      'a\tb\nc\td',
      [
        ['a', 'b'],
        ['c', 'd']
      ]
    ],
    [
      'CRLF rows',
      'a\tb\r\nc\td',
      [
        ['a', 'b'],
        ['c', 'd']
      ]
    ],
    ['a lone CR as a row break', 'a\rb', [['a'], ['b']]],
    ['empty fields between tabs', 'a\t\tb', [['a', '', 'b']]],
    ['the empty string as one empty cell', '', [['']]],
    ['one terminating newline dropped', 'a\tb\r\n', [['a', 'b']]],
    ['a lone newline as one empty cell', '\n', [['']]],
    // Only the format's terminator is an artifact; a second blank line is a real empty row.
    ['two trailing newlines keep one empty row', 'a\n\n', [['a'], ['']]],
    ['a quoted tab', '"a\tb"\tc', [['a\tb', 'c']]],
    ['a quoted LF', '"x\ny"\tz', [['x\ny', 'z']]],
    ['a quoted CRLF kept verbatim', '"a\r\nb"', [['a\r\nb']]],
    ['doubled quotes', '"say ""hi"""', [['say "hi"']]],
    ['a quoted empty field', '""\tb', [['', 'b']]],
    // A quote opens a quoted field only at the start of a field.
    ['a mid-field quote as literal text', 'ab"c\td', [['ab"c', 'd']]]
  ])('reads %s', (_name, text, expected) => {
    expect(parseDataGridClipboardText(text)).toEqual(expected)
  })
})

describe('serializeDataGridClipboardText', () => {
  it.each([
    [
      'a plain grid with CRLF rows',
      [
        ['a', 'b'],
        ['c', 'd']
      ],
      'a\tb\r\nc\td'
    ],
    ['a tab', [['a\tb']], '"a\tb"'],
    ['a newline', [['x\ny']], '"x\ny"'],
    ['a quote, doubled', [['say "hi"']], '"say ""hi"""'],
    ['no rows', [], ''],
    ['an empty cell', [['']], '']
  ])('writes %s', (_name, grid, expected) => {
    expect(serializeDataGridClipboardText(grid)).toBe(expected)
  })

  it('round-trips fields with tabs, quotes, newlines, and empties', () => {
    const grid = [
      ['Hogwarts\tGreat Hall', 'say "Lumos"', ''],
      ['Robert\nLangdon', '', 'Louvre']
    ]
    expect(parseDataGridClipboardText(serializeDataGridClipboardText(grid))).toEqual(grid)
  })

  it('loses a final row of one empty cell, which the format reads as its terminator', () => {
    expect(parseDataGridClipboardText(serializeDataGridClipboardText([['a'], ['']]))).toEqual([
      ['a']
    ])
  })
})

describe('renderDataGridClipboardHtml', () => {
  it('escapes ampersands first, so an entity is not escaped twice', () => {
    expect(renderDataGridClipboardHtml([['a<b', 'x&lt;y', 'p>q']])).toBe(
      '<table><tbody><tr><td>a&lt;b</td><td>x&amp;lt;y</td><td>p&gt;q</td></tr></tbody></table>'
    )
  })

  it('leaves quotes alone and turns each newline flavor into one <br>', () => {
    expect(renderDataGridClipboardHtml([['say "hi"', 'a\nb', 'c\r\nd', 'e\rf']])).toBe(
      '<table><tbody><tr><td>say "hi"</td><td>a<br>b</td><td>c<br>d</td><td>e<br>f</td></tr></tbody></table>'
    )
  })

  it('renders one row per line and an empty body for no rows', () => {
    expect(renderDataGridClipboardHtml([['1'], ['2']])).toBe(
      '<table><tbody><tr><td>1</td></tr><tr><td>2</td></tr></tbody></table>'
    )
    expect(renderDataGridClipboardHtml([])).toBe('<table><tbody></tbody></table>')
  })
})

describe('tileDataGridClipboardBlock', () => {
  it('repeats a 2 x 2 block cyclically over 3 x 3', () => {
    expect(
      tileDataGridClipboardBlock(
        [
          ['1', '2'],
          ['3', '4']
        ],
        3,
        3
      )
    ).toEqual([
      ['1', '2', '1'],
      ['3', '4', '3'],
      ['1', '2', '1']
    ])
  })

  it('fills the target with a single cell', () => {
    expect(tileDataGridClipboardBlock([['x']], 2, 3)).toEqual([
      ['x', 'x', 'x'],
      ['x', 'x', 'x']
    ])
  })

  it('crops a block that is larger than the target to its top-left corner', () => {
    expect(
      tileDataGridClipboardBlock(
        [
          ['a', 'b', 'c'],
          ['d', 'e', 'f'],
          ['g', 'h', 'i']
        ],
        1,
        2
      )
    ).toEqual([['a', 'b']])
  })

  it('cycles a short row of a ragged block over its own length', () => {
    expect(tileDataGridClipboardBlock([['a', 'b'], ['c']], 2, 3)).toEqual([
      ['a', 'b', 'a'],
      ['c', 'c', 'c']
    ])
  })

  it('returns no rows for a zero-row target and empty strings for an empty block', () => {
    expect(tileDataGridClipboardBlock([['a']], 0, 3)).toEqual([])
    expect(tileDataGridClipboardBlock([], 2, 2)).toEqual([
      ['', ''],
      ['', '']
    ])
  })
})

interface Row {
  title: string
}

describe('invertDataGridCellsChange', () => {
  const details: DataGridCellsChangeDetails<Row> = {
    source: 'paste',
    changes: [
      {
        rowId: 'r1',
        columnId: 'title',
        row: { title: 'Origin' },
        previousValue: 'Inferno',
        value: 'Origin'
      },
      {
        rowId: 'r2',
        columnId: 'title',
        row: { title: 'Dune' },
        previousValue: undefined,
        value: 'Dune'
      }
    ],
    rejected: [{ rowId: 'r3', columnId: 'title', raw: 'x', reason: 'invalid' }]
  }

  it('swaps value and previousValue, keeps the rest, and drops the rejections', () => {
    const inverted = invertDataGridCellsChange(details)
    expect(inverted.source).toBe('paste')
    expect(inverted.rejected).toEqual([])
    expect(inverted.changes.map((c) => [c.rowId, c.columnId, c.value, c.previousValue])).toEqual([
      ['r1', 'title', 'Inferno', 'Origin'],
      ['r2', 'title', undefined, 'Dune']
    ])
    expect(inverted.changes[0]!.row).toBe(details.changes[0]!.row)
  })

  it('inverts back to the original changes (redo)', () => {
    expect(invertDataGridCellsChange(invertDataGridCellsChange(details)).changes).toEqual(
      details.changes
    )
  })
})

const column = (cellEdit?: DataGridColumnCellEdit<Row>) => ({ columnDef: { meta: { cellEdit } } })

describe('getDataGridWritableCellEdit', () => {
  const edit: DataGridColumnCellEdit<Row> = { control: 'text' }

  it('is null with no cellEdit or with editable false', () => {
    expect(getDataGridWritableCellEdit(column(), { title: 'a' })).toBeNull()
    expect(getDataGridWritableCellEdit(column({ ...edit, editable: false }))).toBeNull()
  })

  it('returns the cellEdit when editable is true or absent', () => {
    expect(getDataGridWritableCellEdit(column(edit))).toEqual(edit)
    expect(getDataGridWritableCellEdit(column({ ...edit, editable: true }))).toEqual({
      ...edit,
      editable: true
    })
  })

  it('evaluates a function-form editable against the row, and counts it writable with no row', () => {
    const only = column({ ...edit, editable: (row: Row) => row.title === 'Origin' })
    expect(getDataGridWritableCellEdit(only, { title: 'Origin' })).not.toBeNull()
    expect(getDataGridWritableCellEdit(only, { title: 'Inferno' })).toBeNull()
    expect(getDataGridWritableCellEdit(only)).not.toBeNull()
  })
})

describe('getDataGridStepTarget', () => {
  // Display order is start, then center, then end: A, B, C (not selectable), D. D and A are
  // declared first and last, so only the pinning puts them at the edges.
  const grid = mountTestTable<Row>({
    data: [{ title: 'Origin' }],
    columns: [
      { id: 'D', accessorFn: (row) => row.title },
      { id: 'B', accessorFn: (row) => row.title },
      { id: 'C', accessorFn: (row) => row.title, enableCellSelection: false },
      { id: 'A', accessorFn: (row) => row.title }
    ],
    initialState: { columnPinning: { start: ['A'], end: ['D'] } }
  })
  const table = grid.table()
  afterAll(grid.unmount)

  const viewport = document.createElement('div')
  viewport.innerHTML =
    '<table><thead><tr data-row-id="head"></tr></thead>' +
    '<tbody><tr data-row-id="r1"></tr><tr data-row-id="r2"></tr><tr data-row-id="r3"></tr></tbody></table>'

  const step = (rowId: string, columnId: string, direction: 'up' | 'down' | 'left' | 'right') =>
    getDataGridStepTarget(table, viewport, { rowId, columnId }, direction)

  it('moves across the start, center, and end groups and skips a column that cannot be selected', () => {
    expect(step('r1', 'B', 'right')).toEqual({ rowId: 'r1', columnId: 'D' })
    expect(step('r1', 'D', 'left')).toEqual({ rowId: 'r1', columnId: 'B' })
    expect(step('r2', 'A', 'right')).toEqual({ rowId: 'r2', columnId: 'B' })
  })

  it('reports the edge at the first and last selectable column', () => {
    expect(step('r1', 'A', 'left')).toBe('edge')
    expect(step('r1', 'D', 'right')).toBe('edge')
  })

  it('is unresolvable from a column that is not selectable or does not exist', () => {
    expect(step('r1', 'C', 'right')).toBeNull()
    expect(step('r1', 'Z', 'left')).toBeNull()
  })

  it('steps through the rendered body rows, in the same column, and ignores header rows', () => {
    expect(step('r1', 'B', 'down')).toEqual({ rowId: 'r2', columnId: 'B' })
    expect(step('r3', 'B', 'up')).toEqual({ rowId: 'r2', columnId: 'B' })
    expect(step('head', 'B', 'down')).toBeNull()
  })

  it('reports the edge at the first and last rendered row, and null for a row not rendered', () => {
    expect(step('r1', 'B', 'up')).toBe('edge')
    expect(step('r3', 'B', 'down')).toBe('edge')
    expect(step('r9', 'B', 'down')).toBeNull()
  })
})
