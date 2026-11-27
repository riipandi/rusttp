import * as stylex from '@stylexjs/stylex'

// The base: a Hidden shows as `contents` until a breakpoint hides it, so `{ medium: true }` is not a
// plain block below `medium`. The per-breakpoint sets are in `styles/responsive.stylex.ts`.
export const hiddenRoot = stylex.create({ root: { display: 'contents' } })
