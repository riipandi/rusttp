import * as stylex from '@stylexjs/stylex'

// App-wide breakpoints. Importing this file from a style is enough; `vite.config.ts` warms it up
// (`server.warmup`) so `vite dev` has compiled it before the first CSS request.
export const breakpoints = stylex.defineConsts({
  narrow: '@media (max-width: 479px)',
  compact: '@media (max-width: 767px)',
  medium: '@media (min-width: 660px)',
  wide: '@media (min-width: 900px)'
})
