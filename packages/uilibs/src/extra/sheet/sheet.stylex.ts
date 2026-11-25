import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from '../../styles/colors.stylex'
import { stroke, container } from '../../styles/tokens.stylex'
import { unit, radius, zIndex } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

export const sheetStyles = stylex.create({
  overlay: {
    inset: 0,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    position: 'fixed',
    transitionDuration: duration.medium,
    transitionProperty: 'opacity',
    transitionTimingFunction: easing.decelerate,
    zIndex: zIndex.overlay
  },
  content: {
    backgroundColor: colors.backgroundElevationOverlay,
    boxShadow: shadow.overlay,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    gap: unit.x4,
    lineHeight: fontLineHeight.body2,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    position: 'fixed',
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.decelerate,
    zIndex: zIndex.modal
  },
  // Position only: the look is `CloseButton`.
  close: {
    insetInlineEnd: unit.x3,
    position: 'absolute',
    top: unit.x3
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x0_5,
    padding: unit.x4
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2,
    marginTop: 'auto',
    padding: unit.x4
  },
  title: {
    color: colors.foregroundNeutral,
    fontWeight: fontWeight.semibold,
    margin: 0
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    marginTop: unit.x1,
    margin: 0
  }
})

export const sheetSides = stylex.create({
  right: {
    transform: {
      default: 'translate(0, 0)',
      '[data-starting-style]': `translateX(${unit.x10})`,
      '[data-ending-style]': `translateX(${unit.x10})`
    },
    borderBottomLeftRadius: radius.xxlarge,
    borderTopLeftRadius: radius.xxlarge,
    borderLeftColor: colors.borderNeutralFaded,
    borderLeftStyle: 'solid',
    borderLeftWidth: stroke.ring1,
    bottom: 0,
    maxWidth: container.large,
    right: 0,
    top: 0,
    width: '75%'
  },
  left: {
    transform: {
      default: 'translate(0, 0)',
      '[data-starting-style]': `translateX(calc(-1 * ${unit.x10}))`,
      '[data-ending-style]': `translateX(calc(-1 * ${unit.x10}))`
    },
    borderBottomRightRadius: radius.xxlarge,
    borderTopRightRadius: radius.xxlarge,
    borderRightColor: colors.borderNeutralFaded,
    borderRightStyle: 'solid',
    borderRightWidth: stroke.ring1,
    bottom: 0,
    left: 0,
    maxWidth: container.large,
    top: 0,
    width: '75%'
  },
  top: {
    transform: {
      default: 'translate(0, 0)',
      '[data-starting-style]': `translateY(calc(-1 * ${unit.x10}))`,
      '[data-ending-style]': `translateY(calc(-1 * ${unit.x10}))`
    },
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomLeftRadius: radius.xxlarge,
    borderBottomRightRadius: radius.xxlarge,
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1,
    left: 0,
    right: 0,
    top: 0
  },
  bottom: {
    transform: {
      default: 'translate(0, 0)',
      '[data-starting-style]': `translateY(${unit.x10})`,
      '[data-ending-style]': `translateY(${unit.x10})`
    },
    borderBottomStyle: 'none',
    borderTopColor: colors.borderNeutralFaded,
    borderTopLeftRadius: radius.xxlarge,
    borderTopRightRadius: radius.xxlarge,
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1,
    bottom: 0,
    left: 0,
    right: 0
  }
})
