import { describe, expect, it } from 'vitest'
import { breakpoints as tokenBreakpoints } from '../../styles/tokens.stylex'
import { breakpoints as stackBreakpoints } from './stack.stylex'

describe('stack breakpoints', () => {
  it('match the breakpoint tokens, which StyleX cannot import for a top-level key', () => {
    expect(stackBreakpoints).toEqual(tokenBreakpoints)
  })
})
