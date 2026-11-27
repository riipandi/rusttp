import { describe, expect, it } from 'vitest'
import { acceptsFile } from './file-upload.component'

const file = (name: string, type: string) => new File(['x'], name, { type })

describe('acceptsFile', () => {
  it('accepts everything when the list is missing or empty', () => {
    expect(acceptsFile(file('howler.txt', 'text/plain'), undefined)).toBe(true)
    expect(acceptsFile(file('howler.txt', 'text/plain'), '')).toBe(true)
    expect(acceptsFile(file('howler.txt', 'text/plain'), ' , ')).toBe(true)
  })

  it('matches an extension at the end of the name, folding case on both sides', () => {
    expect(acceptsFile(file('Map.PDF', ''), '.pdf')).toBe(true)
    expect(acceptsFile(file('map.pdf', ''), '.PDF')).toBe(true)
    expect(acceptsFile(file('pdf.txt', ''), '.pdf')).toBe(false)
    expect(acceptsFile(file('map.pdf.zip', ''), '.pdf')).toBe(false)
  })

  it('matches a type wildcard on the type family, not on a prefix of it', () => {
    expect(acceptsFile(file('a', 'image/png'), 'image/*')).toBe(true)
    expect(acceptsFile(file('a', 'IMAGE/SVG+XML'), 'image/*')).toBe(true)
    expect(acceptsFile(file('a', 'imagery/png'), 'image/*')).toBe(false)
    expect(acceptsFile(file('a', 'video/mp4'), 'image/*')).toBe(false)
  })

  it('matches an exact type and subtype', () => {
    expect(acceptsFile(file('a', 'application/pdf'), 'application/pdf')).toBe(true)
    expect(acceptsFile(file('a', 'Application/PDF'), 'application/pdf')).toBe(true)
    expect(acceptsFile(file('a', 'application/pdfx'), 'application/pdf')).toBe(false)
    expect(acceptsFile(file('a', 'image/png'), 'image/jpeg')).toBe(false)
  })

  it('accepts a file that matches any token of a comma list, trimmed', () => {
    const accept = ' image/* , .pdf ,application/zip'
    expect(acceptsFile(file('sirius.png', 'image/png'), accept)).toBe(true)
    expect(acceptsFile(file('map.pdf', ''), accept)).toBe(true)
    expect(acceptsFile(file('a.zip', 'application/zip'), accept)).toBe(true)
    expect(acceptsFile(file('howler.txt', 'text/plain'), accept)).toBe(false)
  })
})
