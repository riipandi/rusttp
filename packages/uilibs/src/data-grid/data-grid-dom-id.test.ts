import { describe, expect, it } from 'vitest'
import { getDataGridCellDomId, getDataGridHeaderDomId, toDataGridDomId } from './data-grid'

describe('toDataGridDomId', () => {
  // Every character outside A-Z, a-z, 0-9 becomes `_` and its code in hex: two digits up to
  // U+00FF, and `__` and four digits above it, one UTF-16 code unit at a time. Codes written out
  // by hand: space 0x20, `-` 0x2d, `_` 0x5f, `"` 0x22, é 0xe9, € 0x20ac, 🧙 U+1F9D9 = D83E DDD9.
  it.each([
    ['', ''],
    ['harry', 'harry'],
    ['Row7', 'Row7'],
    ['a b', 'a_20b'],
    ['a_b', 'a_5fb'],
    ['a-b', 'a_2db'],
    ['say "hi"', 'say_20_22hi_22'],
    // Below 0x10 the hex still takes two digits, or `\t5` (`_95`) would equal U+0095.
    ['\t', '_09'],
    ['\t5', '_095'],
    ['\u0095', '_95'],
    ['é', '_e9'],
    ['€', '__20ac'],
    ['🧙', '__d83e__ddd9']
  ])('encodes %j as %j', (value, encoded) => {
    expect(toDataGridDomId(value)).toBe(encoded)
  })

  it('never emits a character a DOM id or an ARIA id list cannot carry', () => {
    for (const value of ['a b\tc\nd', 'x"y\'z', '<b>&amp;</b>', '#.:[]', '🧙 Lumos', 'ωΩ']) {
      expect(toDataGridDomId(value)).toMatch(/^[A-Za-z0-9_]*$/)
    }
  })

  it('gives two different strings two different ids', () => {
    // Every string up to three characters over an alphabet that holds each kind of hazard:
    // the escape itself, the joiner, a space, a letter that is also a hex digit, a character
    // that takes two hex digits and one that takes four.
    const alphabet = ['a', 'f', '5', '-', '_', ' ', 'é', '€']
    const seen = new Map<string, string>()
    let count = 0
    const walk = (prefix: string, depth: number) => {
      const id = toDataGridDomId(prefix)
      expect(
        seen.get(id),
        `${JSON.stringify(prefix)} collides with ${seen.get(id)}`
      ).toBeUndefined()
      seen.set(id, JSON.stringify(prefix))
      count += 1
      if (depth === 0) return
      for (const ch of alphabet) walk(prefix + ch, depth - 1)
    }
    walk('', 3)
    // 1 + 8 + 8^2 + 8^3 strings, all distinct.
    expect(count).toBe(585)
    expect(seen.size).toBe(585)
  })
})

describe('getDataGridCellDomId', () => {
  it('keeps a hyphen in the row id apart from the one between row and column', () => {
    expect(getDataGridCellDomId('g', 'a-b', 'c')).not.toBe(getDataGridCellDomId('g', 'a', 'b-c'))
  })

  it('keeps an underscore and a space apart', () => {
    expect(getDataGridCellDomId('g', 'a b', 'c')).not.toBe(getDataGridCellDomId('g', 'a_b', 'c'))
    expect(getDataGridCellDomId('g', 'a', 'b c')).not.toBe(getDataGridCellDomId('g', 'a', 'b_c'))
  })

  it('is written as grid, cell marker, row, a hyphen, column', () => {
    expect(getDataGridCellDomId('g', 'harry potter', 'house')).toBe('gc-harry_20potter-house')
  })

  it('gives every row and column pair of a small set its own id', () => {
    const rows = ['a', 'a-b', 'a_b', 'a b', 'b', 'b-c', '']
    const ids = new Set<string>()
    for (const row of rows)
      for (const column of rows) ids.add(getDataGridCellDomId('g', row, column))
    expect(ids.size).toBe(rows.length ** 2)
  })
})

describe('getDataGridHeaderDomId', () => {
  it('is written as grid, header marker, header id', () => {
    expect(getDataGridHeaderDomId('g', 'center_1_name')).toBe('gh-center_5f1_5fname')
  })

  it('cannot equal a cell id of the same grid', () => {
    expect(getDataGridHeaderDomId('g', 'a-b')).not.toBe(getDataGridCellDomId('g', 'a', 'b'))
    expect(getDataGridHeaderDomId('g', 'c-a-b')).not.toBe(getDataGridCellDomId('g', 'a', 'b'))
  })
})
