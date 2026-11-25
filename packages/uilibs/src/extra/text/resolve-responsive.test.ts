import type * as stylex from '@stylexjs/stylex'
import { describe, expect, it } from 'vitest'
import { breakpoints as tokenBreakpoints } from '../../styles/tokens.stylex'
import { resolveResponsive, type ResponsiveSpec } from './text.component'
import { breakpoints as textBreakpoints } from './text.stylex'

// Each style is a sentinel named after the breakpoint it comes from and the value it sets, so the
// assertions read as "which style applies from which width up".
const labels = new Map<stylex.CompiledStyles, string>()
const sentinel = (name: string): stylex.CompiledStyles => {
  const style: stylex.CompiledStyles = {}
  labels.set(style, name)
  return style
}
const bucket = (key: string) => ({
  'body-1': sentinel(`${key}:body-1`),
  'body-2': sentinel(`${key}:body-2`),
  'caption-1': sentinel(`${key}:caption-1`)
})
const spec: ResponsiveSpec<'body-1' | 'body-2' | 'caption-1'> = {
  base: bucket('s'),
  m: bucket('m'),
  l: bucket('l'),
  xl: bucket('xl')
}
const names = (styles: stylex.CompiledStyles[]) => styles.map((style) => labels.get(style))

describe('resolveResponsive', () => {
  it('emits nothing for an unset value and the base style for a plain one', () => {
    expect(resolveResponsive(undefined, spec)).toEqual([])
    expect(names(resolveResponsive('body-2', spec))).toEqual(['s:body-2'])
  })

  it('applies each breakpoint from its width up, over the narrower ones', () => {
    const value = { s: 'caption-1', m: 'body-2', l: 'body-1' } as const
    expect(names(resolveResponsive(value, spec))).toEqual(['s:caption-1', 'm:body-2', 'l:body-1'])
  })

  it('lets an omitted breakpoint inherit the nearest smaller one', () => {
    const value = { s: 'caption-1', xl: 'body-1' } as const
    expect(names(resolveResponsive(value, spec))).toEqual(['s:caption-1', 'xl:body-1'])
  })

  it('emits a style where the value returns to an earlier one', () => {
    // A min-width style stays on above its width, so going back to `s`'s value needs its own rule.
    const value = { s: 'body-1', m: 'body-2', l: 'body-1' } as const
    expect(names(resolveResponsive(value, spec))).toEqual(['s:body-1', 'm:body-2', 'l:body-1'])
  })

  it('skips a breakpoint that repeats the value below it, and starts at the first one given', () => {
    expect(names(resolveResponsive({ s: 'body-1', m: 'body-1' }, spec))).toEqual(['s:body-1'])
    expect(names(resolveResponsive({ m: 'body-2', l: 'body-2' }, spec))).toEqual(['m:body-2'])
  })
})

describe('text breakpoints', () => {
  it('match the breakpoint tokens, which StyleX cannot import for a top-level key', () => {
    expect(textBreakpoints).toEqual(tokenBreakpoints)
  })
})
