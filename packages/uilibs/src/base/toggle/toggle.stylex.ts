import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const toggleStyles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:disabled)': colors.backgroundNeutral,
      '[data-pressed]': colors.backgroundNeutral
    },
    borderRadius: radius.large,
    borderStyle: 'none',
    color: {
      default: colors.foregroundNeutral,
      ':hover:not(:disabled)': colors.foregroundNeutral
    },
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

export const toggleVariants = stylex.create({
  default: {},
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
