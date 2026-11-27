import type * as stylex from '@stylexjs/stylex'
import { describe, expect, it } from 'vitest'
import { resolveResponsive, type ResponsiveSpec } from './text.component'

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
  small: bucket('small'),
  medium: bucket('medium'),
  large: bucket('large'),
  xlarge: bucket('xlarge')
}
const names = (styles: stylex.CompiledStyles[]) => styles.map((style) => labels.get(style))

describe('resolveResponsive', () => {
  it('emits nothing for an unset value and the base style for a plain one', () => {
    expect(resolveResponsive(undefined, spec)).toEqual([])
    expect(names(resolveResponsive('body-2', spec))).toEqual(['small:body-2'])
  })

  it('applies each breakpoint from its width up, over the narrower ones', () => {
    const value = { small: 'caption-1', medium: 'body-2', large: 'body-1' } as const
    expect(names(resolveResponsive(value, spec))).toEqual([
      'small:caption-1',
      'medium:body-2',
      'large:body-1'
    ])
  })

  it('lets an omitted breakpoint inherit the nearest smaller one', () => {
    const value = { small: 'caption-1', xlarge: 'body-1' } as const
    expect(names(resolveResponsive(value, spec))).toEqual(['small:caption-1', 'xlarge:body-1'])
  })

  it('emits a style where the value returns to an earlier one', () => {
    // A min-width style stays on above its width, so going back to `small`'s value needs its own rule.
    const value = { small: 'body-1', medium: 'body-2', large: 'body-1' } as const
    expect(names(resolveResponsive(value, spec))).toEqual([
      'small:body-1',
      'medium:body-2',
      'large:body-1'
    ])
  })

  it('skips a breakpoint that repeats the value below it, and starts at the first one given', () => {
    expect(names(resolveResponsive({ small: 'body-1', medium: 'body-1' }, spec))).toEqual([
      'small:body-1'
    ])
    expect(names(resolveResponsive({ medium: 'body-2', large: 'body-2' }, spec))).toEqual([
      'medium:body-2'
    ])
  })
})
