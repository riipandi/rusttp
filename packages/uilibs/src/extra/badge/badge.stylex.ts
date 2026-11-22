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

// The shape of each variant; its colors come from the tone maps below.
export const badgeVariants = stylex.create({
  primary: {},
  secondary: {},
  outline: {
    borderStyle: 'solid',
    borderWidth: stroke.ring1
  },
  ghost: {
    backgroundColor: 'transparent'
  }
})

// `primary` is a solid fill, `secondary` a faded one, `outline` an edge, `ghost` text only.
export const badgeSolidTones = stylex.create({
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

export const badgeFadedTones = stylex.create({
  neutral: { backgroundColor: colors.backgroundNeutral, color: colors.foregroundNeutral },
  primary: { backgroundColor: colors.backgroundPrimaryFaded, color: colors.foregroundPrimary },
  positive: { backgroundColor: colors.backgroundPositiveFaded, color: colors.foregroundPositive },
  warning: { backgroundColor: colors.backgroundWarningFaded, color: colors.foregroundWarning },
  critical: { backgroundColor: colors.backgroundCriticalFaded, color: colors.foregroundCritical }
})

export const badgeOutlineTones = stylex.create({
  neutral: { borderColor: colors.borderNeutralFaded, color: colors.foregroundNeutral },
  primary: { borderColor: colors.borderPrimary, color: colors.foregroundPrimary },
  positive: { borderColor: colors.borderPositive, color: colors.foregroundPositive },
  warning: { borderColor: colors.borderWarning, color: colors.foregroundWarning },
  critical: { borderColor: colors.borderCritical, color: colors.foregroundCritical }
})

export const badgeGhostTones = stylex.create({
  neutral: { color: colors.foregroundNeutral },
  primary: { color: colors.foregroundPrimary },
  positive: { color: colors.foregroundPositive },
  warning: { color: colors.foregroundWarning },
  critical: { color: colors.foregroundCritical }
})
