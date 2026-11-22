import * as stylex from '@stylexjs/stylex'

// App-wide breakpoints. Importing this file from a style is enough; `vite.config.ts` warms it up
// (`server.warmup`) so `vite dev` has compiled it before the first CSS request. They sit beside the
// library's `breakpoints` (`uilibs/styles/tokens.stylex`): `medium` and `wide` are its `viewport`
// values (660 and 900) written as open-ended queries, which StyleX only inlines from this file;
// `narrow` and `compact` are the app's own steps for the form row and the layout swap.
export const breakpoints = stylex.defineConsts({
  narrow: '@media (max-width: 479px)',
  compact: '@media (max-width: 767px)',
  medium: '@media (min-width: 660px)',
  wide: '@media (min-width: 900px)'
})

/** Wrap a transition or animation value: `{ default: 'width', [motion.reduce]: 'none' }`. */
export const motion = stylex.defineConsts({
  reduce: '@media (prefers-reduced-motion: reduce)'
})

/** The widths a page is laid out in, and the gutter beside its content. */
export const layoutSize = stylex.defineConsts({
  page: '80rem',
  reading: '36rem',
  form: '26rem',
  gutter: 'clamp(1.5rem, 4vw, 3rem)',
  adminInset: 'clamp(1.5rem, 3vw, 2rem)'
})
