import { describe, expect, it } from 'vitest'
import { breakpoints as tokenBreakpoints } from '../../styles/tokens.stylex'
import { breakpoints as hiddenBreakpoints } from './hidden.stylex'

describe('hidden breakpoints', () => {
  it('match the breakpoint tokens, which StyleX cannot import for a top-level key', () => {
    expect(hiddenBreakpoints).toEqual(tokenBreakpoints)
  })
})
