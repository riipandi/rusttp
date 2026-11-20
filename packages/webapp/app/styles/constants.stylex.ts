import * as stylex from '@stylexjs/stylex'

// Shared by the admin layout, its sidebar, and the account row, which change shape together.
export const breakpoints = stylex.defineConsts({
  narrow: '@media (max-width: 767px)'
})
