import * as stylex from '@stylexjs/stylex'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const badgeStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.full,
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    gap: unit.x1,
    outlineOffset: stroke.ring2,
    whiteSpace: 'nowrap'
  },
  squared: { borderRadius: radius.small },
  highlighted: { opacity: 0.8 },
  dismiss: {
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    borderRadius: radius.full,
    borderStyle: 'none',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    justifyContent: 'center',
    marginInlineEnd: `calc(-1 * ${unit.x1})`,
    padding: 0,
    // The dismiss target is a 24px square (WCAG 2.5.8) around the glyph, at every badge size,
    // without growing the badge: `50%` is half the glyph, so the box is centered on it.
    position: 'relative',
    '::after': {
      content: '""',
      inset: `calc(50% - ${unit.x3})`,
      position: 'absolute'
    }
  }
})

// `medium` is the badge as it was before sizes existed.
export const badgeSizes = stylex.create({
  small: {
    fontSize: fontSize.caption2,
    lineHeight: fontLineHeight.caption2,
    paddingBlock: unit.x0_5,
    paddingInline: unit.x2
  },
  medium: {
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1,
    paddingBlock: unit.x1,
    paddingInline: unit.x3
  },
  large: {
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    paddingBlock: unit.x1_5,
    paddingInline: unit.x4
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
  primary: { backgroundColor: colors.backgroundPrimary, color: fixedColors.onBackgroundPrimary },
  positive: {
    backgroundColor: colors.backgroundPositive,
    color: fixedColors.onBackgroundPositive
  },
  warning: {
    backgroundColor: colors.backgroundWarning,
    color: fixedColors.onBackgroundWarning
  },
  critical: {
    backgroundColor: colors.backgroundCritical,
    color: fixedColors.onBackgroundCritical
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
