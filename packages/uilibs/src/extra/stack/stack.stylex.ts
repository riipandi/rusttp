import * as stylex from '@stylexjs/stylex'

// The direction and gap sets are in `styles/responsive.stylex.ts`, with the other sets that change per
// breakpoint.

export const stackStyles = stylex.create({
  root: { display: 'flex', flexDirection: 'column' },
  wrap: { flexWrap: 'wrap' }
})

export const stackAlign = stylex.create({
  start: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  stretch: { alignItems: 'stretch' },
  baseline: { alignItems: 'baseline' }
})

export const stackJustify = stylex.create({
  start: { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  end: { justifyContent: 'flex-end' },
  'space-between': { justifyContent: 'space-between' },
  'space-around': { justifyContent: 'space-around' },
  'space-evenly': { justifyContent: 'space-evenly' }
})
