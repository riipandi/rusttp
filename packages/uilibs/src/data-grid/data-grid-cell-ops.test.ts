import type { ColumnDef } from '@tanstack/react-table'
import { afterAll, describe, expect, it } from 'vitest'
import type {
  DataGridCellsChangeDetails,
  DataGridColumnCellEdit,
  DataGridFeatures
} from './data-grid'
import {
  buildDataGridClearDetails,
  buildDataGridFillDetails,
  buildDataGridPasteDetails,
  extendDataGridSelection,
  getDataGridActiveRegionGrid,
  getDataGridClipboardValue,
  getDataGridStepTarget,
  getDataGridVisibleSelectedCellCount,
  getDataGridWritableCellEdit,
  invertDataGridCellsChange,
  parseDataGridClipboardText,
  renderDataGridClipboardHtml,
  serializeDataGridClipboardText,
  tileDataGridClipboardBlock
} from './data-grid-cell-ops'
import { mountTestTable, students } from './test-table'
import type { Student } from './test-table'

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

// Five rows (harry, hermione, draco, luna, cedric) and, in display order: name 0, house 1,
// wards 2 (opted out of selection), year 3, wand 4 (read only: no cellEdit).
const parseYear = (raw: string) => (/^\d+$/.test(raw) ? Number(raw) : undefined)
const writableColumns: ColumnDef<DataGridFeatures, Student>[] = [
  { id: 'name', accessorKey: 'name', meta: { cellEdit: {} } },
  { id: 'house', accessorKey: 'house', meta: { cellEdit: { clearValue: '' } } },
  { id: 'wards', accessorFn: () => 'ward', enableCellSelection: false },
  { id: 'year', accessorKey: 'year', meta: { cellEdit: { parse: parseYear } } },
  { id: 'wand', accessorFn: () => 'holly' }
]
const isSlytherin = (row: unknown) =>
  typeof row === 'object' && row !== null && 'house' in row && row.house === 'Slytherin'
const valuesOf = (details: DataGridCellsChangeDetails<Student>) =>
  details.changes.map((change) => [change.rowId, change.columnId, change.value])

describe('buildDataGridPasteDetails', () => {
  const grid = mountTestTable<Student>({
    data: students,
    columns: writableColumns,
    getRowId: (student) => student.id
  })
  afterAll(grid.unmount)
  const paste = (block: string[][]) => buildDataGridPasteDetails(grid.table(), block)

  it('fills the whole region with a 1 x 1 block', () => {
    grid.select(['harry', 'name'], ['hermione', 'house'])
    const result = paste([['Hogwarts']])!
    expect(result.details.source).toBe('paste')
    expect(valuesOf(result.details)).toEqual([
      ['harry', 'name', 'Hogwarts'],
      ['harry', 'house', 'Hogwarts'],
      ['hermione', 'name', 'Hogwarts'],
      ['hermione', 'house', 'Hogwarts']
    ])
    expect(result.details.changes[0]!.previousValue).toBe('Harry Potter')
    expect(result.details.rejected).toEqual([])
    expect(result.target).toEqual({
      startRowIndex: 0,
      endRowIndex: 1,
      rowCount: 2,
      startColumnIndex: 0,
      endColumnIndex: 1
    })
  })

  it('tiles a block over a region that is an exact multiple of it', () => {
    grid.select(['harry', 'name'], ['luna', 'house'])
    const result = paste([['Alohomora'], ['Lumos']])!
    expect(valuesOf(result.details)).toEqual([
      ['harry', 'name', 'Alohomora'],
      ['harry', 'house', 'Alohomora'],
      ['hermione', 'name', 'Lumos'],
      ['hermione', 'house', 'Lumos'],
      ['draco', 'name', 'Alohomora'],
      ['draco', 'house', 'Alohomora'],
      ['luna', 'name', 'Lumos'],
      ['luna', 'house', 'Lumos']
    ])
    expect(result.target.endRowIndex).toBe(3)
  })

  it('pastes a block once from the top-left when the region is not a multiple of its rows', () => {
    grid.select(['harry', 'name'], ['draco', 'house'])
    const result = paste([
      ['Hedwig', 'Owl'],
      ['Crookshanks', 'Cat']
    ])!
    expect(valuesOf(result.details)).toEqual([
      ['harry', 'name', 'Hedwig'],
      ['harry', 'house', 'Owl'],
      ['hermione', 'name', 'Crookshanks'],
      ['hermione', 'house', 'Cat']
    ])
    expect(result.target).toMatchObject({ endRowIndex: 1, rowCount: 2, endColumnIndex: 1 })
  })

  it('pastes once, past the region, when the rows fit but the columns do not', () => {
    // 2 rows x 2 columns of region against a 2 x 3 block: the rows divide, the columns do not.
    // The third block column lands on year, compacted over the opted-out wards column.
    grid.select(['harry', 'name'], ['hermione', 'house'])
    const result = paste([
      ['Hagrid', 'Hippogriff', '7'],
      ['Buckbeak', 'Norbert', '8']
    ])!
    expect(valuesOf(result.details)).toEqual([
      ['harry', 'name', 'Hagrid'],
      ['harry', 'house', 'Hippogriff'],
      ['harry', 'year', 7],
      ['hermione', 'name', 'Buckbeak'],
      ['hermione', 'house', 'Norbert'],
      ['hermione', 'year', 8]
    ])
    expect(result.target.endColumnIndex).toBe(3)
  })

  it('compacts an opted-out column in the middle of the region', () => {
    grid.select(['harry', 'house'], ['harry', 'year'])
    const result = paste([['Slytherin', '6']])!
    expect(valuesOf(result.details)).toEqual([
      ['harry', 'house', 'Slytherin'],
      ['harry', 'year', 6]
    ])
    expect(result.details.rejected).toEqual([])
    expect(result.target).toMatchObject({ startColumnIndex: 1, endColumnIndex: 3 })
  })

  it('clamps at the last row and the last column, and rejects a read-only cell', () => {
    // From cedric, the last row, year and wand are the only columns left.
    grid.select(['cedric', 'year'], ['cedric', 'year'])
    const result = paste([
      ['7', 'x', 'y'],
      ['8', 'z', 'w']
    ])!
    expect(valuesOf(result.details)).toEqual([['cedric', 'year', 7]])
    expect(result.details.rejected).toEqual([
      { rowId: 'cedric', columnId: 'wand', raw: 'x', reason: 'readonly' }
    ])
    expect(result.target).toEqual({
      startRowIndex: 4,
      endRowIndex: 4,
      rowCount: 1,
      startColumnIndex: 3,
      endColumnIndex: 4
    })
  })

  it('rejects a value its parse returns undefined for, and keeps the rest', () => {
    grid.select(['harry', 'year'], ['harry', 'year'])
    const result = paste([['Dumbledore']])!
    expect(result.details.changes).toEqual([])
    expect(result.details.rejected).toEqual([
      { rowId: 'harry', columnId: 'year', raw: 'Dumbledore', reason: 'invalid' }
    ])
  })

  it('gives a row-dependent editable the row each cell belongs to', () => {
    const locked = mountTestTable<Student>({
      data: students,
      columns: [
        {
          id: 'house',
          accessorKey: 'house',
          meta: {
            // Slytherin is locked: only the row decides.
            cellEdit: { editable: (row) => !isSlytherin(row) }
          }
        }
      ],
      getRowId: (student) => student.id
    })
    locked.select(['hermione', 'house'], ['luna', 'house'])
    const result = buildDataGridPasteDetails(locked.table(), [['Hufflepuff']])!
    locked.unmount()
    expect(valuesOf(result.details)).toEqual([
      ['hermione', 'house', 'Hufflepuff'],
      ['luna', 'house', 'Hufflepuff']
    ])
    expect(result.details.rejected).toEqual([
      { rowId: 'draco', columnId: 'house', raw: 'Hufflepuff', reason: 'readonly' }
    ])
  })

  it('is null with no selection, an empty block, or a region of opted-out columns only', () => {
    grid.act((table) => table.setCellSelection([]))
    expect(paste([['x']])).toBeNull()
    grid.select(['harry', 'name'], ['harry', 'name'])
    expect(paste([])).toBeNull()
    grid.select(['harry', 'wards'], ['harry', 'wards'])
    expect(paste([['x']])).toBeNull()
  })
})

const viewportWith = (...ids: string[]) => {
  const viewport = document.createElement('div')
  viewport.innerHTML =
    '<table><tbody>' +
    ids.map((id) => `<tr data-row-id="${id}"></tr>`).join('') +
    '</tbody></table>'
  return viewport
}

describe('paste and clear with rows the view cannot show', () => {
  // Page 1 of 2 rows (harry, hermione) of 5: the other rows are off-page, in display order.
  const paged = mountTestTable<Student>({
    data: students,
    columns: writableColumns,
    getRowId: (student) => student.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
  })
  afterAll(paged.unmount)
  it('skips off-page rows, but not a row the DOM renders outside the page', () => {
    paged.select(['harry', 'name'], ['luna', 'name'])
    const pageOnly = buildDataGridPasteDetails(paged.table(), [['Quidditch']], viewportWith())!
    expect(valuesOf(pageOnly.details).map(([id]) => id)).toEqual(['harry', 'hermione'])
    expect(pageOnly.target).toMatchObject({ endRowIndex: 1, rowCount: 2 })

    // luna is rendered outside the page (a pinned draft): draco, between them, still is not.
    const withLuna = buildDataGridPasteDetails(
      paged.table(),
      [['Quidditch']],
      viewportWith('luna')
    )!
    expect(valuesOf(withLuna.details).map(([id]) => id)).toEqual(['harry', 'hermione', 'luna'])
    expect(withLuna.target).toMatchObject({ endRowIndex: 3, rowCount: 3 })
  })

  it('clears every display row without a viewport, and only the rendered ones with one', () => {
    paged.select(['harry', 'name'], ['luna', 'name'])
    const all = buildDataGridClearDetails(paged.table(), 'clear', false)!
    expect(all.changes.map((change) => change.rowId)).toEqual([
      'harry',
      'hermione',
      'draco',
      'luna'
    ])
    const visible = buildDataGridClearDetails(paged.table(), 'clear', false, viewportWith())!
    expect(visible.changes.map((change) => change.rowId)).toEqual(['harry', 'hermione'])
  })
})

describe('buildDataGridClearDetails', () => {
  const grid = mountTestTable<Student>({
    data: students,
    columns: writableColumns,
    getRowId: (student) => student.id
  })
  afterAll(grid.unmount)
  const clear = (source: 'clear' | 'cut', activeRegionOnly = false) =>
    buildDataGridClearDetails(grid.table(), source, activeRegionOnly)

  it('clears to clearValue when a column has one and to null when it has none', () => {
    grid.select(['harry', 'name'], ['harry', 'year'])
    const details = clear('clear')!
    expect(details.source).toBe('clear')
    expect(details.rejected).toEqual([])
    expect(details.changes.map((c) => [c.columnId, c.previousValue, c.value])).toEqual([
      ['name', 'Harry Potter', null],
      ['house', 'Gryffindor', ''],
      ['year', 5, null]
    ])
    expect(details.changes[0]!.row).toBe(students[0])
  })

  it('carries the cut source, and skips opted-out and read-only columns without a rejection', () => {
    grid.select(['draco', 'name'], ['draco', 'wand'])
    const details = clear('cut')!
    expect(details.source).toBe('cut')
    // wards (opted out) and wand (no cellEdit) are not in the batch.
    expect(details.changes.map((change) => change.columnId)).toEqual(['name', 'house', 'year'])
    expect(details.rejected).toEqual([])
  })

  it('clears every region, or only the active one', () => {
    grid.select(['harry', 'name'], ['harry', 'name'])
    grid.act((table) =>
      table.selectCellRange(
        { anchorRowId: 'luna', anchorColumnId: 'name', focusRowId: 'luna', focusColumnId: 'name' },
        { mode: 'include' }
      )
    )
    expect(clear('clear')!.changes.map((change) => change.rowId)).toEqual(['harry', 'luna'])
    // The newest range is anchored at the focused cell, luna: it is the active one.
    expect(clear('clear', true)!.changes.map((change) => change.rowId)).toEqual(['luna'])
  })

  it('is null with no selection or with nothing writable selected', () => {
    grid.act((table) => table.setCellSelection([]))
    expect(clear('clear')).toBeNull()
    grid.select(['harry', 'wand'], ['hermione', 'wand'])
    expect(clear('clear')).toBeNull()
  })
})

describe('getDataGridClipboardValue', () => {
  it.each([
    ['null', null, ''],
    ['undefined', undefined, ''],
    ['a string, unchanged', 'Hedwig', 'Hedwig'],
    ['the empty string', '', ''],
    // Falsy values that are data, not blanks.
    ['zero', 0, '0'],
    ['a negative float', -1.5, '-1.5'],
    ['false', false, 'false'],
    ['true', true, 'true'],
    ['a bigint', 12n, '12'],
    ['a symbol', Symbol('Horcrux'), 'Symbol(Horcrux)'],
    [
      'an object as JSON, not [object Object]',
      { house: 'Gryffindor', year: 5 },
      '{"house":"Gryffindor","year":5}'
    ],
    ['an array as JSON', ['Harry', 'Ron'], '["Harry","Ron"]']
  ])('writes %s', (_name, value, expected) => {
    expect(getDataGridClipboardValue(value)).toBe(expected)
  })
})

// The grid's meta types a row as unknown, so the format narrows it itself.
const firstName = (row: unknown) =>
  typeof row === 'object' && row !== null && 'name' in row && typeof row.name === 'string'
    ? row.name.split(' ')[0]
    : ''
const formatted: ColumnDef<DataGridFeatures, Student>[] = [
  ...writableColumns.slice(0, 3),
  {
    id: 'year',
    accessorKey: 'year',
    meta: { cellEdit: { format: (value, row) => `${firstName(row)}:${String(value)}` } }
  },
  writableColumns[4]!
]

describe('getDataGridActiveRegionGrid', () => {
  const grid = mountTestTable<Student>({
    data: students,
    columns: formatted,
    getRowId: (student) => student.id
  })
  afterAll(grid.unmount)
  const region = (viewport?: HTMLElement) => getDataGridActiveRegionGrid(grid.table(), viewport)

  it('is null with nothing selected', () => {
    grid.act((table) => table.setCellSelection([]))
    expect(region()).toBeNull()
  })

  it('reads the region row-major as strings', () => {
    grid.select(['hermione', 'name'], ['draco', 'house'])
    expect(region()).toEqual([
      ['Hermione Granger', 'Gryffindor'],
      ['Draco Malfoy', 'Slytherin']
    ])
  })

  it('compacts an opted-out column away and formats through the column format', () => {
    grid.select(['luna', 'house'], ['cedric', 'year'])
    // wards sits between house and year and is not in the grid; a number with no format is a
    // string, and year has a format.
    expect(region()).toEqual([
      ['Ravenclaw', 'Luna:4'],
      ['Hufflepuff', 'Cedric:6']
    ])
  })

  it('reads a column without cellEdit through the plain value rules', () => {
    grid.select(['harry', 'wand'], ['harry', 'wand'])
    expect(region()).toEqual([['holly']])
  })

  it('is the region of the focused cell when there are several', () => {
    grid.select(['harry', 'name'], ['harry', 'name'])
    grid.act((table) =>
      table.selectCellRange(
        {
          anchorRowId: 'luna',
          anchorColumnId: 'house',
          focusRowId: 'cedric',
          focusColumnId: 'house'
        },
        { mode: 'include' }
      )
    )
    expect(region()).toEqual([['Ravenclaw'], ['Hufflepuff']])
  })

  it('is the newest region even when another one lies further down and right', () => {
    // getCellSelectionBounds sorts geometrically, so the bottom-right rectangle is last; the
    // focused cell anchors the newest range, and that one is active.
    grid.select(['luna', 'house'], ['cedric', 'house'])
    grid.act((table) =>
      table.selectCellRange(
        {
          anchorRowId: 'harry',
          anchorColumnId: 'name',
          focusRowId: 'hermione',
          focusColumnId: 'name'
        },
        { mode: 'include' }
      )
    )
    expect(region()).toEqual([['Harry Potter'], ['Hermione Granger']])
  })

  it('falls back to the bottom-right region when the focused cell is in none', () => {
    grid.select(['harry', 'name'], ['harry', 'name'])
    grid.act((table) =>
      table.selectCellRange(
        {
          anchorRowId: 'luna',
          anchorColumnId: 'house',
          focusRowId: 'cedric',
          focusColumnId: 'house'
        },
        { mode: 'include' }
      )
    )
    // The newest range is an exclude anchored on a third cell that no region holds.
    grid.act((table) =>
      table.selectCellRange(
        {
          anchorRowId: 'draco',
          anchorColumnId: 'year',
          focusRowId: 'draco',
          focusColumnId: 'year'
        },
        { mode: 'exclude' }
      )
    )
    expect(grid.table().getCellSelectionBounds()).toHaveLength(2)
    expect(region()).toEqual([['Ravenclaw'], ['Hufflepuff']])
  })

  it('is null when the region holds only opted-out columns', () => {
    grid.select(['harry', 'wards'], ['hermione', 'wards'])
    // Two rows, each with no cell: two empty lines are still not a grid worth copying.
    expect(region()?.flat()).toEqual([])
  })

  it('skips rows the view cannot show when a viewport is given', () => {
    const paged = mountTestTable<Student>({
      data: students,
      columns: formatted,
      getRowId: (student) => student.id,
      initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
    })
    paged.select(['hermione', 'name'], ['luna', 'name'])
    const table = paged.table()
    expect(getDataGridActiveRegionGrid(table)).toEqual([
      ['Hermione Granger'],
      ['Draco Malfoy'],
      ['Luna Lovegood']
    ])
    expect(getDataGridActiveRegionGrid(table, viewportWith())).toEqual([['Hermione Granger']])
    expect(getDataGridActiveRegionGrid(table, viewportWith('luna'))).toEqual([
      ['Hermione Granger'],
      ['Luna Lovegood']
    ])
    paged.select(['luna', 'name'], ['cedric', 'name'])
    expect(getDataGridActiveRegionGrid(paged.table(), viewportWith())).toBeNull()
    paged.unmount()
  })
})

describe('getDataGridVisibleSelectedCellCount', () => {
  const grid = mountTestTable<Student>({
    data: students,
    columns: writableColumns,
    getRowId: (student) => student.id
  })
  afterAll(grid.unmount)
  const count = () => getDataGridVisibleSelectedCellCount(grid.table(), null)

  it('is 0 with nothing selected', () => {
    grid.act((table) => table.setCellSelection([]))
    expect(count()).toBe(0)
  })

  it('counts rows times selectable columns, without the opted-out one', () => {
    // name..year is 4 display columns, 3 of them selectable.
    grid.select(['harry', 'name'], ['hermione', 'year'])
    expect(count()).toBe(6)
    grid.select(['harry', 'house'], ['harry', 'house'])
    expect(count()).toBe(1)
  })

  it('is 0 for a region of opted-out columns only', () => {
    grid.select(['harry', 'wards'], ['draco', 'wards'])
    expect(count()).toBe(0)
  })

  it('adds the cells of every region', () => {
    grid.select(['harry', 'name'], ['hermione', 'name'])
    grid.act((table) =>
      table.selectCellRange(
        {
          anchorRowId: 'luna',
          anchorColumnId: 'house',
          focusRowId: 'cedric',
          focusColumnId: 'year'
        },
        { mode: 'include' }
      )
    )
    // 2 x 1 and 2 x 2 (house and year; wards is not selectable).
    expect(count()).toBe(2 + 4)
  })

  it('counts only the rows the view can show, with a viewport', () => {
    const paged = mountTestTable<Student>({
      data: students,
      columns: writableColumns,
      getRowId: (student) => student.id,
      initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
    })
    paged.select(['harry', 'name'], ['luna', 'house'])
    const table = paged.table()
    // Four display rows by two columns, against two page rows, then three with luna rendered.
    expect(getDataGridVisibleSelectedCellCount(table, null)).toBe(8)
    expect(getDataGridVisibleSelectedCellCount(table, viewportWith())).toBe(4)
    expect(getDataGridVisibleSelectedCellCount(table, viewportWith('luna'))).toBe(6)
    paged.unmount()
  })
})

describe('extendDataGridSelection', () => {
  const grid = mountTestTable<Student>({
    data: students,
    columns: writableColumns,
    getRowId: (student) => student.id
  })
  afterAll(grid.unmount)
  const all = viewportWith(...students.map((student) => student.id))
  const boundOf = () => grid.table().getCellSelectionBounds()
  const extend = (direction: 'up' | 'down' | 'left' | 'right') =>
    extendDataGridSelection(grid.table(), all, direction)

  it('grows the range from the anchor and returns the corner it grew to', () => {
    grid.select(['hermione', 'house'], ['hermione', 'house'])
    expect(extend('down')).toEqual({ rowId: 'draco', columnId: 'house' })
    expect(boundOf()).toEqual([
      { minRowIndex: 1, maxRowIndex: 2, minColumnIndex: 1, maxColumnIndex: 1 }
    ])
    expect(extend('right')).toEqual({ rowId: 'draco', columnId: 'year' })
    expect(boundOf()).toEqual([
      { minRowIndex: 1, maxRowIndex: 2, minColumnIndex: 1, maxColumnIndex: 3 }
    ])
  })

  it('grows up and left from the anchor, and returns the corner it grew to', () => {
    grid.select(['draco', 'house'], ['draco', 'house'])
    expect(extend('up')).toEqual({ rowId: 'hermione', columnId: 'house' })
    expect(extend('left')).toEqual({ rowId: 'hermione', columnId: 'name' })
    expect(boundOf()).toEqual([
      { minRowIndex: 1, maxRowIndex: 2, minColumnIndex: 0, maxColumnIndex: 1 }
    ])
  })

  it('shrinks back toward the anchor', () => {
    grid.select(['hermione', 'house'], ['draco', 'year'])
    expect(extend('left')).toEqual({ rowId: 'draco', columnId: 'house' })
    expect(extend('up')).toEqual({ rowId: 'hermione', columnId: 'house' })
    expect(boundOf()).toEqual([
      { minRowIndex: 1, maxRowIndex: 1, minColumnIndex: 1, maxColumnIndex: 1 }
    ])
  })

  it('returns null at the first and last row', () => {
    grid.select(['harry', 'name'], ['harry', 'name'])
    expect(extend('up')).toBeNull()
    expect(extend('left')).toBeNull()
    grid.select(['cedric', 'name'], ['cedric', 'name'])
    expect(extend('down')).toBeNull()
    expect(boundOf()).toEqual([
      { minRowIndex: 4, maxRowIndex: 4, minColumnIndex: 0, maxColumnIndex: 0 }
    ])
  })

  it('steps onto a pinned row outside the page slice, which the feature cannot resolve', () => {
    // Page of 2 rows (harry, hermione); cedric is pinned at the bottom and rendered after them.
    const pinned = mountTestTable<Student>({
      data: students,
      columns: writableColumns,
      getRowId: (student) => student.id,
      keepPinnedRows: true,
      initialState: {
        pagination: { pageIndex: 0, pageSize: 2 },
        rowPinning: { top: [], bottom: ['cedric'] }
      }
    })
    pinned.select(['hermione', 'name'], ['hermione', 'name'])
    const rendered = viewportWith('harry', 'hermione', 'cedric')
    expect(extendDataGridSelection(pinned.table(), rendered, 'down')).toEqual({
      rowId: 'cedric',
      columnId: 'name'
    })
    // The range runs from hermione (display row 1) to cedric (display row 4).
    expect(pinned.table().getCellSelectionBounds()).toEqual([
      { minRowIndex: 1, maxRowIndex: 4, minColumnIndex: 0, maxColumnIndex: 0 }
    ])
    pinned.unmount()
  })
})

const isHouse = (house: string, row: unknown) =>
  typeof row === 'object' && row !== null && 'house' in row && row.house === house
const parseLabel = (raw: string) => (raw.startsWith('Year ') ? Number(raw.slice(5)) : undefined)

describe('buildDataGridFillDetails', () => {
  // Down: name 0 and house 1 take any value; the house of a Ravenclaw is locked; wards 2 is
  // opted out of selection; year 3 has a parse that a fill must NOT run (same-column values stay
  // raw); wand 4 is read only.
  const rowColumns: ColumnDef<DataGridFeatures, Student>[] = [
    { id: 'name', accessorKey: 'name', meta: { cellEdit: {} } },
    {
      id: 'house',
      accessorKey: 'house',
      meta: { cellEdit: { editable: (row) => !isHouse('Ravenclaw', row) } }
    },
    { id: 'wards', accessorFn: () => 'ward', enableCellSelection: false },
    { id: 'year', accessorKey: 'year', meta: { cellEdit: { parse: () => undefined } } },
    { id: 'wand', accessorFn: () => 'holly' }
  ]
  const down = mountTestTable<Student>({
    data: students,
    columns: rowColumns,
    getRowId: (student) => student.id
  })
  afterAll(down.unmount)
  const visible = (table: ReturnType<typeof down.table>, hidden: string[] = []) =>
    table
      .getRowsInDisplayOrder()
      .map((row, displayIndex) => ({ row, displayIndex }))
      .filter(({ row }) => !hidden.includes(row.id))
  const fillDown = (count: number, hidden?: string[]) => {
    const table = down.table()
    return buildDataGridFillDetails(
      table,
      table.getCellSelectionBounds()[0]!,
      'row',
      count,
      visible(table, hidden)
    )
  }

  it('cycles the source rows over the target rows by offset modulo the source height', () => {
    down.select(['harry', 'name'], ['hermione', 'year'])
    const result = fillDown(3)!
    expect(result.details.source).toBe('fill')
    // draco <- harry, luna <- hermione, cedric <- harry; wards and wand are not written, the
    // locked Ravenclaw house is skipped without a rejection, and year keeps its raw 5.
    expect(valuesOf(result.details)).toEqual([
      ['draco', 'name', 'Harry Potter'],
      ['draco', 'house', 'Gryffindor'],
      ['draco', 'year', 5],
      ['luna', 'name', 'Hermione Granger'],
      ['luna', 'year', 5],
      ['cedric', 'name', 'Harry Potter'],
      ['cedric', 'house', 'Gryffindor'],
      ['cedric', 'year', 5]
    ])
    expect(result.details.rejected).toEqual([])
    expect(result.details.changes[0]).toMatchObject({
      previousValue: 'Draco Malfoy',
      row: students[2]
    })
    expect(result.target).toEqual({
      startRowIndex: 0,
      endRowIndex: 4,
      startColumnIndex: 0,
      endColumnIndex: 3
    })
  })

  it('walks the rows the view shows, so a row it hides is skipped and not written', () => {
    down.select(['harry', 'name'], ['hermione', 'name'])
    const result = fillDown(2, ['draco'])!
    expect(valuesOf(result.details)).toEqual([
      ['luna', 'name', 'Harry Potter'],
      ['cedric', 'name', 'Hermione Granger']
    ])
    expect(result.target.endRowIndex).toBe(4)
  })

  it('stops at the last row the view shows when the count runs past it', () => {
    down.select(['harry', 'name'], ['luna', 'name'])
    const result = fillDown(10)!
    expect(valuesOf(result.details)).toEqual([['cedric', 'name', 'Harry Potter']])
  })

  it('is null when no row lies below the source', () => {
    down.select(['cedric', 'name'], ['cedric', 'name'])
    expect(fillDown(3)).toBeNull()
  })

  // Right: year 0 is the source, formatted as "Year 5"; label 1 parses only that form; house 2
  // parses only digits; wards 3 is opted out and wand 4 is read only, so neither is written;
  // name 5 has no parse and so receives the raw value, except on a Hufflepuff row, which is locked.
  const columnColumns: ColumnDef<DataGridFeatures, Student>[] = [
    {
      id: 'year',
      accessorKey: 'year',
      meta: { cellEdit: { format: (value) => `Year ${String(value)}` } }
    },
    { id: 'label', accessorFn: () => 'old', meta: { cellEdit: { parse: parseLabel } } },
    { id: 'house', accessorKey: 'house', meta: { cellEdit: { parse: parseYear } } },
    { id: 'wards', accessorFn: () => 'ward', enableCellSelection: false },
    { id: 'wand', accessorFn: () => 'holly' },
    {
      id: 'name',
      accessorKey: 'name',
      meta: { cellEdit: { editable: (row) => !isHouse('Hufflepuff', row) } }
    }
  ]
  const right = mountTestTable<Student>({
    data: students,
    columns: columnColumns,
    getRowId: (student) => student.id
  })
  afterAll(right.unmount)
  const fillRight = (count: number) => {
    const table = right.table()
    return buildDataGridFillDetails(
      table,
      table.getCellSelectionBounds()[0]!,
      'column',
      count,
      visible(table)
    )
  }

  it('rounds a column fill through the source format and the target parse', () => {
    right.select(['luna', 'year'], ['cedric', 'year'])
    const result = fillRight(5)!
    expect(valuesOf(result.details)).toEqual([
      ['luna', 'label', 4],
      ['luna', 'name', 4],
      ['cedric', 'label', 6]
    ])
    // house parses digits only and the source formats as "Year n": a rejection, not a skip.
    expect(result.details.rejected).toEqual([
      { rowId: 'luna', columnId: 'house', raw: 'Year 4', reason: 'invalid' },
      { rowId: 'cedric', columnId: 'house', raw: 'Year 6', reason: 'invalid' }
    ])
    expect(result.details.changes[0]).toMatchObject({ previousValue: 'old' })
    expect(result.target).toEqual({
      startRowIndex: 3,
      endRowIndex: 4,
      startColumnIndex: 0,
      endColumnIndex: 5
    })
  })

  it('writes only as many columns as the count reaches', () => {
    right.select(['luna', 'year'], ['luna', 'year'])
    const result = fillRight(1)!
    expect(valuesOf(result.details)).toEqual([['luna', 'label', 4]])
    expect(result.target.endColumnIndex).toBe(1)
  })

  it('is an empty batch, not null, when nothing to the right can be written', () => {
    // The drag still grows the selection over the columns it reached.
    right.select(['luna', 'name'], ['luna', 'name'])
    const result = fillRight(2)!
    expect(result.details.changes).toEqual([])
    expect(result.details.rejected).toEqual([])
    expect(result.target.endColumnIndex).toBe(7)
  })
})
