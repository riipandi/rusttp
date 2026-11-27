import * as stylex from '@stylexjs/stylex'
import {
  fontLetterSpacing,
  fontLineHeight,
  fontSize,
  fontFamilyVar,
  fontWeightVar,
  unit
} from './tokens.stylex'

// Every style set that changes per breakpoint (`Text` variants, `Stack` direction and gap, `Hidden`),
// in one file. A set keys the whole style on the media query, mobile first: `small` is the base set
// and each wider one adds a rule from its width up, over the narrower ones. The rule is not nested
// in a property because `stylex.props` keeps only the last value of a property: a nested set with no
// `default` would erase the narrower breakpoint's value instead of stacking over it.
//
// `breakpoints` is declared here again and not imported from `tokens.stylex.ts`: @stylexjs/babel-plugin
// 0.19 resolves a media constant used as a top-level key only when it is declared in the SAME file
// (an imported one fails with "Invalid pseudo or at-rule"; reproduced on 0.19.2). For the same
// reason the style objects a set repeats at every breakpoint live here, not in the component's
// stylesheet. `breakpoints.test.ts` fails if this drifts from `viewport` in `tokens.stylex.ts`.
export const breakpoints = stylex.defineConsts({
  medium: '@media (min-width: 660px)',
  large: '@media (min-width: 900px)',
  xlarge: '@media (min-width: 1280px)'
})

// -----------------------------------------------------------------------------
// Text
// -----------------------------------------------------------------------------

const headline1 = {
  fontFamily: fontFamilyVar.headline1,
  fontSize: fontSize.headline1,
  letterSpacing: fontLetterSpacing.headline1,
  fontWeight: fontWeightVar.headline1,
  lineHeight: fontLineHeight.headline1
}
const headline2 = {
  fontFamily: fontFamilyVar.headline2,
  fontSize: fontSize.headline2,
  letterSpacing: fontLetterSpacing.headline2,
  fontWeight: fontWeightVar.headline2,
  lineHeight: fontLineHeight.headline2
}
const headline3 = {
  fontFamily: fontFamilyVar.headline3,
  fontSize: fontSize.headline3,
  letterSpacing: fontLetterSpacing.headline3,
  fontWeight: fontWeightVar.headline3,
  lineHeight: fontLineHeight.headline3
}
const featured1 = {
  fontFamily: fontFamilyVar.featured1,
  fontSize: fontSize.featured1,
  letterSpacing: fontLetterSpacing.featured1,
  fontWeight: fontWeightVar.featured1,
  lineHeight: fontLineHeight.featured1
}
const featured2 = {
  fontFamily: fontFamilyVar.featured2,
  fontSize: fontSize.featured2,
  letterSpacing: fontLetterSpacing.featured2,
  fontWeight: fontWeightVar.featured2,
  lineHeight: fontLineHeight.featured2
}
const featured3 = {
  fontFamily: fontFamilyVar.featured3,
  fontSize: fontSize.featured3,
  letterSpacing: fontLetterSpacing.featured3,
  fontWeight: fontWeightVar.featured3,
  lineHeight: fontLineHeight.featured3
}
const featured4 = {
  fontFamily: fontFamilyVar.featured4,
  fontSize: fontSize.featured4,
  letterSpacing: fontLetterSpacing.featured4,
  fontWeight: fontWeightVar.featured4,
  lineHeight: fontLineHeight.featured4
}
const featured5 = {
  fontFamily: fontFamilyVar.featured5,
  fontSize: fontSize.featured5,
  letterSpacing: fontLetterSpacing.featured5,
  fontWeight: fontWeightVar.featured5,
  lineHeight: fontLineHeight.featured5
}
const featured6 = {
  fontFamily: fontFamilyVar.featured6,
  fontSize: fontSize.featured6,
  letterSpacing: fontLetterSpacing.featured6,
  fontWeight: fontWeightVar.featured6,
  lineHeight: fontLineHeight.featured6
}
const body1 = {
  fontFamily: fontFamilyVar.body1,
  fontSize: fontSize.body1,
  letterSpacing: fontLetterSpacing.body1,
  fontWeight: fontWeightVar.body1,
  lineHeight: fontLineHeight.body1
}
const body2 = {
  fontFamily: fontFamilyVar.body2,
  fontSize: fontSize.body2,
  letterSpacing: fontLetterSpacing.body2,
  fontWeight: fontWeightVar.body2,
  lineHeight: fontLineHeight.body2
}
const caption1 = {
  fontFamily: fontFamilyVar.caption1,
  fontSize: fontSize.caption1,
  letterSpacing: fontLetterSpacing.caption1,
  fontWeight: fontWeightVar.caption1,
  lineHeight: fontLineHeight.caption1
}
const caption2 = {
  fontFamily: fontFamilyVar.caption2,
  fontSize: fontSize.caption2,
  letterSpacing: fontLetterSpacing.caption2,
  fontWeight: fontWeightVar.caption2,
  lineHeight: fontLineHeight.caption2
}

export const textVariantStyles = stylex.create({
  'headline-1': headline1,
  'headline-2': headline2,
  'headline-3': headline3,
  'featured-1': featured1,
  'featured-2': featured2,
  'featured-3': featured3,
  'featured-4': featured4,
  'featured-5': featured5,
  'featured-6': featured6,
  'body-1': body1,
  'body-2': body2,
  'caption-1': caption1,
  'caption-2': caption2
})

export const textVariantStylesMedium = stylex.create({
  'headline-1': { [breakpoints.medium]: headline1 },
  'headline-2': { [breakpoints.medium]: headline2 },
  'headline-3': { [breakpoints.medium]: headline3 },
  'featured-1': { [breakpoints.medium]: featured1 },
  'featured-2': { [breakpoints.medium]: featured2 },
  'featured-3': { [breakpoints.medium]: featured3 },
  'featured-4': { [breakpoints.medium]: featured4 },
  'featured-5': { [breakpoints.medium]: featured5 },
  'featured-6': { [breakpoints.medium]: featured6 },
  'body-1': { [breakpoints.medium]: body1 },
  'body-2': { [breakpoints.medium]: body2 },
  'caption-1': { [breakpoints.medium]: caption1 },
  'caption-2': { [breakpoints.medium]: caption2 }
})

export const textVariantStylesLarge = stylex.create({
  'headline-1': { [breakpoints.large]: headline1 },
  'headline-2': { [breakpoints.large]: headline2 },
  'headline-3': { [breakpoints.large]: headline3 },
  'featured-1': { [breakpoints.large]: featured1 },
  'featured-2': { [breakpoints.large]: featured2 },
  'featured-3': { [breakpoints.large]: featured3 },
  'featured-4': { [breakpoints.large]: featured4 },
  'featured-5': { [breakpoints.large]: featured5 },
  'featured-6': { [breakpoints.large]: featured6 },
  'body-1': { [breakpoints.large]: body1 },
  'body-2': { [breakpoints.large]: body2 },
  'caption-1': { [breakpoints.large]: caption1 },
  'caption-2': { [breakpoints.large]: caption2 }
})

export const textVariantStylesXLarge = stylex.create({
  'headline-1': { [breakpoints.xlarge]: headline1 },
  'headline-2': { [breakpoints.xlarge]: headline2 },
  'headline-3': { [breakpoints.xlarge]: headline3 },
  'featured-1': { [breakpoints.xlarge]: featured1 },
  'featured-2': { [breakpoints.xlarge]: featured2 },
  'featured-3': { [breakpoints.xlarge]: featured3 },
  'featured-4': { [breakpoints.xlarge]: featured4 },
  'featured-5': { [breakpoints.xlarge]: featured5 },
  'featured-6': { [breakpoints.xlarge]: featured6 },
  'body-1': { [breakpoints.xlarge]: body1 },
  'body-2': { [breakpoints.xlarge]: body2 },
  'caption-1': { [breakpoints.xlarge]: caption1 },
  'caption-2': { [breakpoints.xlarge]: caption2 }
})

// -----------------------------------------------------------------------------
// Stack
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Hidden
// -----------------------------------------------------------------------------

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
