import * as stylex from '@stylexjs/stylex'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { duration, easing, fontFamily, fontWeight, fontSize } from '../../styles/tokens.stylex'

export const avatarStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.full,
    display: 'inline-flex',
    // Fixed-size chrome: never let a flex row squeeze the avatar.
    flexShrink: 0,
    fontFamily: fontFamily.body,
    justifyContent: 'center',
    // No overflow:hidden here — it would clip AvatarBadge at the corner;
    // the image and fallback round themselves instead.
    position: 'relative',
    userSelect: 'none',
    verticalAlign: 'middle'
  },
  // The image and fallback take the root's corners, so `squared` reaches them.
  squared: { borderRadius: radius.medium },
  // The image mounts once it has loaded, so it fades in from `data-starting-style`; the fallback
  // it replaces leaves at once. Reduced motion shows the picture without the fade.
  image: {
    borderRadius: 'inherit',
    height: '100%',
    objectFit: 'cover',
    opacity: { default: 1, '[data-starting-style]': 0, '[data-ending-style]': 0 },
    transitionDuration: duration.medium,
    transitionProperty: { default: 'opacity', '@media (prefers-reduced-motion: reduce)': 'none' },
    transitionTimingFunction: easing.decelerate,
    width: '100%'
  },
  fallback: {
    alignItems: 'center',
    borderRadius: 'inherit',
    display: 'flex',
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    height: '100%',
    justifyContent: 'center',
    width: '100%'
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.backgroundPage,
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: stroke.ring2,
    color: fixedColors.onBackgroundPrimary,
    display: 'flex',
    insetInlineEnd: 0,
    insetBlockEnd: 0,
    justifyContent: 'center',
    minHeight: unit.x4,
    minWidth: unit.x4,
    position: 'absolute'
  },
  group: {
    alignItems: 'center',
    display: 'flex'
  },
  groupItem: {
    borderRadius: radius.full,
    display: 'inline-flex'
  },
  groupItemOverlap: {
    marginInlineStart: `calc(-1 * ${unit.x2})`
  },
  groupItemStack: (order: number) => ({
    zIndex: order
  }),
  groupCount: {
    alignItems: 'center',
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.full,
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    justifyContent: 'center'
  }
})

// The fallback's fill and initials color: `faded` is a soft tint, `solid` a full fill.
export const avatarFills = {
  faded: stylex.create({
    neutral: { backgroundColor: colors.backgroundNeutral, color: colors.foregroundNeutralFaded },
    primary: { backgroundColor: colors.backgroundPrimaryFaded, color: colors.foregroundPrimary },
    positive: { backgroundColor: colors.backgroundPositiveFaded, color: colors.foregroundPositive },
    warning: { backgroundColor: colors.backgroundWarningFaded, color: colors.foregroundWarning },
    critical: { backgroundColor: colors.backgroundCriticalFaded, color: colors.foregroundCritical }
  }),
  solid: stylex.create({
    neutral: { backgroundColor: colors.foregroundNeutral, color: colors.backgroundPage },
    primary: { backgroundColor: colors.backgroundPrimary, color: fixedColors.onBackgroundPrimary },
    positive: {
      backgroundColor: colors.backgroundPositive,
      color: fixedColors.onBackgroundPositive
    },
    warning: { backgroundColor: colors.backgroundWarning, color: fixedColors.onBackgroundWarning },
    critical: {
      backgroundColor: colors.backgroundCritical,
      color: fixedColors.onBackgroundCritical
    }
  })
}

export const avatarSizes = stylex.create({
  small: { height: unit.x8, width: unit.x8 },
  medium: { height: unit.x10, width: unit.x10 },
  large: { height: unit.x12, width: unit.x12 }
})
