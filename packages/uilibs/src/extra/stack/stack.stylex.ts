import * as stylex from '@stylexjs/stylex'
import { unit } from '../../styles/tokens.stylex'

// Mirror of `breakpoints` from `styles/tokens.stylex.ts`, for the reason `text.stylex.ts` gives: a media
// constant used as a top-level key resolves only from the file that declares it. A responsive set
// has to key its style on the media query (`{ [breakpoints.medium]: { gap } }`), not nest the query
// in the property: `stylex.props` keeps the last value of a property, so a nested set with no
// `default` would erase the narrower breakpoint's value instead of stacking over it. `stack.test.ts`
// fails if this drifts from the tokens.
export const breakpoints = stylex.defineConsts({
  medium: '@media (min-width: 660px)',
  large: '@media (min-width: 900px)',
  xlarge: '@media (min-width: 1280px)'
})

export const stackStyles = stylex.create({
  root: { display: 'flex', flexDirection: 'column' },
  wrap: { flexWrap: 'wrap' }
})

// One style set per responsive prop (direction and gap) and breakpoint. `small` is the base style; each wider set adds a
// rule from its width up, over the narrower ones. A `stylex.create` can only hold literal keys, so
// the sets are written out in full.

export const stackDirection = stylex.create({
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  'row-reverse': { flexDirection: 'row-reverse' },
  'column-reverse': { flexDirection: 'column-reverse' }
})

export const stackDirectionMedium = stylex.create({
  row: { [breakpoints.medium]: { flexDirection: 'row' } },
  column: { [breakpoints.medium]: { flexDirection: 'column' } },
  'row-reverse': { [breakpoints.medium]: { flexDirection: 'row-reverse' } },
  'column-reverse': { [breakpoints.medium]: { flexDirection: 'column-reverse' } }
})

export const stackDirectionLarge = stylex.create({
  row: { [breakpoints.large]: { flexDirection: 'row' } },
  column: { [breakpoints.large]: { flexDirection: 'column' } },
  'row-reverse': { [breakpoints.large]: { flexDirection: 'row-reverse' } },
  'column-reverse': { [breakpoints.large]: { flexDirection: 'column-reverse' } }
})

export const stackDirectionXLarge = stylex.create({
  row: { [breakpoints.xlarge]: { flexDirection: 'row' } },
  column: { [breakpoints.xlarge]: { flexDirection: 'column' } },
  'row-reverse': { [breakpoints.xlarge]: { flexDirection: 'row-reverse' } },
  'column-reverse': { [breakpoints.xlarge]: { flexDirection: 'column-reverse' } }
})

export const stackGap = stylex.create({
  '0': { gap: 0 },
  '0.5': { gap: unit.x0_5 },
  '1': { gap: unit.x1 },
  '1.5': { gap: unit.x1_5 },
  '2': { gap: unit.x2 },
  '3': { gap: unit.x3 },
  '4': { gap: unit.x4 },
  '5': { gap: unit.x5 },
  '6': { gap: unit.x6 },
  '7': { gap: unit.x7 },
  '8': { gap: unit.x8 },
  '9': { gap: unit.x9 },
  '10': { gap: unit.x10 },
  '12': { gap: unit.x12 },
  '14': { gap: unit.x14 },
  '16': { gap: unit.x16 },
  '18': { gap: unit.x18 },
  '20': { gap: unit.x20 }
})

export const stackGapMedium = stylex.create({
  '0': { [breakpoints.medium]: { gap: 0 } },
  '0.5': { [breakpoints.medium]: { gap: unit.x0_5 } },
  '1': { [breakpoints.medium]: { gap: unit.x1 } },
  '1.5': { [breakpoints.medium]: { gap: unit.x1_5 } },
  '2': { [breakpoints.medium]: { gap: unit.x2 } },
  '3': { [breakpoints.medium]: { gap: unit.x3 } },
  '4': { [breakpoints.medium]: { gap: unit.x4 } },
  '5': { [breakpoints.medium]: { gap: unit.x5 } },
  '6': { [breakpoints.medium]: { gap: unit.x6 } },
  '7': { [breakpoints.medium]: { gap: unit.x7 } },
  '8': { [breakpoints.medium]: { gap: unit.x8 } },
  '9': { [breakpoints.medium]: { gap: unit.x9 } },
  '10': { [breakpoints.medium]: { gap: unit.x10 } },
  '12': { [breakpoints.medium]: { gap: unit.x12 } },
  '14': { [breakpoints.medium]: { gap: unit.x14 } },
  '16': { [breakpoints.medium]: { gap: unit.x16 } },
  '18': { [breakpoints.medium]: { gap: unit.x18 } },
  '20': { [breakpoints.medium]: { gap: unit.x20 } }
})

export const stackGapLarge = stylex.create({
  '0': { [breakpoints.large]: { gap: 0 } },
  '0.5': { [breakpoints.large]: { gap: unit.x0_5 } },
  '1': { [breakpoints.large]: { gap: unit.x1 } },
  '1.5': { [breakpoints.large]: { gap: unit.x1_5 } },
  '2': { [breakpoints.large]: { gap: unit.x2 } },
  '3': { [breakpoints.large]: { gap: unit.x3 } },
  '4': { [breakpoints.large]: { gap: unit.x4 } },
  '5': { [breakpoints.large]: { gap: unit.x5 } },
  '6': { [breakpoints.large]: { gap: unit.x6 } },
  '7': { [breakpoints.large]: { gap: unit.x7 } },
  '8': { [breakpoints.large]: { gap: unit.x8 } },
  '9': { [breakpoints.large]: { gap: unit.x9 } },
  '10': { [breakpoints.large]: { gap: unit.x10 } },
  '12': { [breakpoints.large]: { gap: unit.x12 } },
  '14': { [breakpoints.large]: { gap: unit.x14 } },
  '16': { [breakpoints.large]: { gap: unit.x16 } },
  '18': { [breakpoints.large]: { gap: unit.x18 } },
  '20': { [breakpoints.large]: { gap: unit.x20 } }
})

export const stackGapXLarge = stylex.create({
  '0': { [breakpoints.xlarge]: { gap: 0 } },
  '0.5': { [breakpoints.xlarge]: { gap: unit.x0_5 } },
  '1': { [breakpoints.xlarge]: { gap: unit.x1 } },
  '1.5': { [breakpoints.xlarge]: { gap: unit.x1_5 } },
  '2': { [breakpoints.xlarge]: { gap: unit.x2 } },
  '3': { [breakpoints.xlarge]: { gap: unit.x3 } },
  '4': { [breakpoints.xlarge]: { gap: unit.x4 } },
  '5': { [breakpoints.xlarge]: { gap: unit.x5 } },
  '6': { [breakpoints.xlarge]: { gap: unit.x6 } },
  '7': { [breakpoints.xlarge]: { gap: unit.x7 } },
  '8': { [breakpoints.xlarge]: { gap: unit.x8 } },
  '9': { [breakpoints.xlarge]: { gap: unit.x9 } },
  '10': { [breakpoints.xlarge]: { gap: unit.x10 } },
  '12': { [breakpoints.xlarge]: { gap: unit.x12 } },
  '14': { [breakpoints.xlarge]: { gap: unit.x14 } },
  '16': { [breakpoints.xlarge]: { gap: unit.x16 } },
  '18': { [breakpoints.xlarge]: { gap: unit.x18 } },
  '20': { [breakpoints.xlarge]: { gap: unit.x20 } }
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
