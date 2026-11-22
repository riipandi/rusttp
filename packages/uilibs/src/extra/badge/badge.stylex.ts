import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const badgeStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.full,
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    gap: unit.x1,
    lineHeight: fontLineHeight.caption1,
    outlineOffset: stroke.ring2,
    paddingBlock: unit.x1,
    paddingInline: unit.x3,
    whiteSpace: 'nowrap'
  }
})

// The shape of each variant; its colors come from the color maps below.
export const badgeVariants = stylex.create({
  solid: {},
  faded: {},
  outline: {
    borderStyle: 'solid',
    borderWidth: stroke.ring1
  },
  ghost: {
    backgroundColor: 'transparent'
  }
})

// `solid` is a solid fill, `faded` a soft tint, `outline` an edge, `ghost` text only.
export const badgeSolidColors = stylex.create({
  neutral: { backgroundColor: colors.foregroundNeutral, color: colors.backgroundPage },
  primary: { backgroundColor: colors.backgroundPrimary, color: colors.onBrand },
  positive: {
    backgroundColor: colors.backgroundPositive,
    color: colors.onBackgroundPositive
  },
  warning: {
    backgroundColor: colors.backgroundWarning,
    color: colors.onBackgroundWarning
  },
  critical: {
    backgroundColor: colors.backgroundCritical,
    color: colors.onBackgroundCritical
  }
})

export const badgeFadedColors = stylex.create({
  neutral: { backgroundColor: colors.backgroundNeutral, color: colors.foregroundNeutral },
  primary: { backgroundColor: colors.backgroundPrimaryFaded, color: colors.foregroundPrimary },
  positive: { backgroundColor: colors.backgroundPositiveFaded, color: colors.foregroundPositive },
  warning: { backgroundColor: colors.backgroundWarningFaded, color: colors.foregroundWarning },
  critical: { backgroundColor: colors.backgroundCriticalFaded, color: colors.foregroundCritical }
})

export const badgeOutlineColors = stylex.create({
  neutral: { borderColor: colors.borderNeutralFaded, color: colors.foregroundNeutral },
  primary: { borderColor: colors.borderPrimary, color: colors.foregroundPrimary },
  positive: { borderColor: colors.borderPositive, color: colors.foregroundPositive },
  warning: { borderColor: colors.borderWarning, color: colors.foregroundWarning },
  critical: { borderColor: colors.borderCritical, color: colors.foregroundCritical }
})

export const badgeGhostColors = stylex.create({
  neutral: { color: colors.foregroundNeutral },
  primary: { color: colors.foregroundPrimary },
  positive: { color: colors.foregroundPositive },
  warning: { color: colors.foregroundWarning },
  critical: { color: colors.foregroundCritical }
})
