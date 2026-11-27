import { describe, expect, it } from 'vitest'
import type { DataGridTableVirtualScrollAlignment } from './data-grid-table-virtual'
import { getDataGridTableScrollTarget } from './data-grid-table-virtual'

// A 200 px viewport scrolled to 100 over 1000 px of content, with a 40 px sticky header: rows
// are visible between 140 and 300. Rows are 50 px tall unless a case says otherwise.
const target = (
  align: DataGridTableVirtualScrollAlignment,
  rowTop: number,
  over: Partial<Parameters<typeof getDataGridTableScrollTarget>[0]> = {}
) =>
  getDataGridTableScrollTarget({
    align,
    clientHeight: 200,
    rowBottom: rowTop + (over.rowHeight ?? 50),
    rowHeight: 50,
    rowTop,
    scrollHeight: 1000,
    scrollTop: 100,
    viewportTopOffset: 40,
    ...over
  })

describe('getDataGridTableScrollTarget, auto', () => {
  it('is null for a row that is fully in view, including one touching either edge', () => {
    expect(target('auto', 180)).toBeNull()
    expect(target('auto', 140)).toBeNull()
    expect(target('auto', 250)).toBeNull()
  })

  it('puts a row above the viewport just under the sticky header', () => {
    // Row top 139 is one pixel above the 140 viewport top.
    expect(target('auto', 139)).toBe(99)
    expect(target('auto', 120)).toBe(80)
  })

  it('puts a row below the viewport at the bottom edge', () => {
    // Row bottom 301 is one pixel below the 300 viewport bottom.
    expect(target('auto', 251)).toBe(101)
    expect(target('auto', 280)).toBe(130)
  })
})

describe('getDataGridTableScrollTarget, start, end, and center', () => {
  it('start puts the row under the sticky header', () => {
    expect(target('start', 500)).toBe(460)
  })

  it('end puts the row bottom at the bottom edge', () => {
    expect(target('end', 500)).toBe(350)
  })

  it('center puts the row in the middle of the visible height, which excludes the header', () => {
    // Visible 160, row 50: (160 - 50) / 2 = 55 above it; 500 - 40 - 55.
    expect(target('center', 500)).toBe(405)
  })

  it('center never lifts a row taller than the visible height above its top', () => {
    expect(target('center', 500, { rowHeight: 300 })).toBe(460)
  })

  it('does not subtract the header when there is none', () => {
    expect(target('start', 500, { viewportTopOffset: undefined })).toBe(500)
    expect(target('center', 500, { viewportTopOffset: undefined })).toBe(500 - 75)
  })

  it('has no visible height at all when the header is taller than the viewport', () => {
    expect(target('center', 500, { clientHeight: 100, viewportTopOffset: 150 })).toBe(350)
  })
})

describe('getDataGridTableScrollTarget, clamping', () => {
  it('never scrolls above the top', () => {
    expect(target('start', 10)).toBe(0)
    expect(target('end', 40, { rowHeight: 60 })).toBe(0)
  })

  it('never scrolls past the end of the content (1000 - 200 = 800)', () => {
    expect(target('start', 840)).toBe(800)
    expect(target('start', 841)).toBe(800)
    expect(target('start', 900)).toBe(800)
    expect(target('end', 990)).toBe(800)
  })

  it('stays at the top when the content is shorter than the viewport', () => {
    expect(target('start', 100, { scrollHeight: 150 })).toBe(0)
  })
})
