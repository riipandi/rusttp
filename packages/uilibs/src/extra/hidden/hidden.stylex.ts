import * as stylex from '@stylexjs/stylex'

// Mirror of `breakpoints` from `styles/tokens.stylex.ts`, for the reason `text.stylex.ts` gives: a media
// constant used as a top-level key resolves only from the file that declares it. A style that is
// hidden from a width up has to key on the media query, because a nested `display` with no `default`
// would erase the narrower breakpoint's value instead of stacking over it. `hidden.test.ts` fails if
// this drifts from the tokens.
export const breakpoints = stylex.defineConsts({
  medium: '@media (min-width: 660px)',
  large: '@media (min-width: 900px)',
  xlarge: '@media (min-width: 1280px)'
})

// The base: a Hidden shows as `contents` until a breakpoint hides it, so `{ medium: true }` is not a
// plain block below `medium`.
export const hiddenRoot = stylex.create({ root: { display: 'contents' } })

// `contents` takes the wrapper out of the layout, so the children sit in the parent as if it were
// not there; `none` removes them.
export const hiddenSmall = stylex.create({
  hide: { display: 'none' },
  show: { display: 'contents' }
})

export const hiddenMedium = stylex.create({
  hide: { [breakpoints.medium]: { display: 'none' } },
  show: { [breakpoints.medium]: { display: 'contents' } }
})

export const hiddenLarge = stylex.create({
  hide: { [breakpoints.large]: { display: 'none' } },
  show: { [breakpoints.large]: { display: 'contents' } }
})

export const hiddenXLarge = stylex.create({
  hide: { [breakpoints.xlarge]: { display: 'none' } },
  show: { [breakpoints.xlarge]: { display: 'contents' } }
})
