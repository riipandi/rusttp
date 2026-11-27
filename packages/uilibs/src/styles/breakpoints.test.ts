import { describe, expect, it } from 'vitest'
import { breakpoints as hiddenBreakpoints } from '../extra/hidden/hidden.stylex'
import { breakpoints as stackBreakpoints } from '../extra/stack/stack.stylex'
import { breakpoints as textBreakpoints } from '../extra/text/text.stylex'
import { BREAKPOINTS } from '../hooks/use-media-query'
import { breakpoints, viewport } from './tokens.stylex'

// `viewport` is the source: a media query cannot read a StyleX constant for a top-level key and a
// hook cannot import one, so every other copy of a width is restated and must agree with it here.
const names = ['medium', 'large', 'xlarge'] as const

describe('breakpoints', () => {
  it('has a pixel width for each name, so no mirror below is compared with nothing', () => {
    expect(Object.keys(viewport)).toEqual(names)
    for (const name of names) expect(viewport[name]).toBeTypeOf('number')
  })

  it.each([
    ['the tokens', breakpoints],
    ['the text sets', textBreakpoints],
    ['the stack sets', stackBreakpoints],
    ['the hidden sets', hiddenBreakpoints]
  ])('%s use the width of each `viewport` entry as a min-width media query', (_name, mirror) => {
    for (const name of names) expect(mirror[name]).toBe(`@media (min-width: ${viewport[name]}px)`)
  })

  it.each(names)('the hook starts %s at its `viewport` width', (name) => {
    expect(BREAKPOINTS[name]).toBe(viewport[name])
  })
})
