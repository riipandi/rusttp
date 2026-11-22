import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

const hover = ':hover:not(:disabled)'

export const toggleStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.large,
    borderStyle: 'none',
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x1,
    justifyContent: 'center',
    lineHeight: fontLineHeight.body2,
    userSelect: 'none',
    whiteSpace: 'nowrap'
  }
})

// The fill and text color of a `ghost` or `outline` toggle, by the color of its pressed state.
export const toggleQuiet = stylex.create({
  neutral: {
    backgroundColor: {
      default: 'transparent',
      [hover]: colors.backgroundNeutral,
      '[data-pressed]': colors.backgroundNeutral
    },
    color: { default: colors.foregroundNeutral, [hover]: colors.foregroundNeutral }
  },
  primary: {
    backgroundColor: {
      default: 'transparent',
      [hover]: colors.backgroundNeutral,
      '[data-pressed]': colors.backgroundPrimaryFaded
    },
    color: { default: colors.foregroundNeutral, '[data-pressed]': colors.foregroundPrimary }
  },
  critical: {
    backgroundColor: {
      default: 'transparent',
      [hover]: colors.backgroundNeutral,
      '[data-pressed]': colors.backgroundCriticalFaded
    },
    color: { default: colors.foregroundNeutral, '[data-pressed]': colors.foregroundCritical }
  }
})

// A `solid` toggle rests on a neutral fill and presses to the solid color.
export const toggleSolid = stylex.create({
  neutral: {
    backgroundColor: {
      default: colors.backgroundNeutral,
      [hover]: colors.backgroundNeutralHighlighted,
      '[data-pressed]': colors.foregroundNeutral
    },
    color: { default: colors.foregroundNeutral, '[data-pressed]': colors.backgroundPage }
  },
  primary: {
    backgroundColor: {
      default: colors.backgroundNeutral,
      [hover]: colors.backgroundNeutralHighlighted,
      '[data-pressed]': colors.backgroundPrimary
    },
    color: { default: colors.foregroundNeutral, '[data-pressed]': colors.onBrand }
  },
  critical: {
    backgroundColor: {
      default: colors.backgroundNeutral,
      [hover]: colors.backgroundNeutralHighlighted,
      '[data-pressed]': colors.backgroundCritical
    },
    color: { default: colors.foregroundNeutral, '[data-pressed]': colors.onBackgroundCritical }
  }
})

export const toggleVariants = stylex.create({
  ghost: {},
  solid: {},
  outline: {
    borderColor: colors.borderNeutralFaded,
    borderStyle: 'solid',
    borderWidth: stroke.ring1
  }
})

// sm, md, and lg take height and type from `controlSizes`; the toggle keeps its own padding and
// is at least as wide as it is tall.
export const toggleSizes = stylex.create({
  xs: {
    fontSize: fontSize.caption1,
    height: unit.x7,
    minWidth: unit.x7,
    paddingInline: unit.x2
  },
  sm: { minWidth: unit.x8, paddingInline: unit.x2 },
  md: { minWidth: unit.x9, paddingInline: unit.x2 },
  lg: { minWidth: unit.x10, paddingInline: unit.x2 }
})
