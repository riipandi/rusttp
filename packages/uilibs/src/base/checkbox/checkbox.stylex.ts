import * as stylex from '@stylexjs/stylex'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { duration, easing, fontFamily } from '../../styles/tokens.stylex'

export const checkboxStyles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      default: colors.backgroundPage,
      '[data-checked]:not([data-disabled])': colors.backgroundPrimary,
      '[data-indeterminate]:not([data-disabled])': colors.backgroundPrimary,
      '[data-disabled]': colors.backgroundNeutral
    },
    borderColor: {
      default: colors.borderControl,
      '[data-checked]:not([data-disabled])': colors.backgroundPrimary,
      '[data-indeterminate]:not([data-disabled])': colors.backgroundPrimary,
      '[data-invalid]:not([data-disabled])': colors.borderCritical,
      '[data-disabled]': colors.borderDisabled
    },
    borderRadius: radius.small,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    padding: 0,
    position: 'relative',
    // Invisible expanded hit area (larger touch target).
    '::after': {
      content: '""',
      insetBlock: `calc(-1 * ${unit.x2})`,
      insetInline: `calc(-1 * ${unit.x3})`,
      position: 'absolute'
    }
  },
  indicator: {
    alignItems: 'center',
    color: {
      default: fixedColors.onBackgroundPrimary,
      '[data-disabled]': colors.foregroundDisabled
    },
    display: 'flex',
    justifyContent: 'center',
    // The mark scales up from 60% and fades in, and out again, through Base UI's starting and
    // ending styles; reduced motion keeps the fade and drops the scale.
    opacity: { default: 1, '[data-starting-style]': 0, '[data-ending-style]': 0 },
    transform: {
      default: 'none',
      '[data-starting-style]': {
        default: 'scale(0.6)',
        '@media (prefers-reduced-motion: reduce)': 'none'
      },
      '[data-ending-style]': {
        default: 'scale(0.6)',
        '@media (prefers-reduced-motion: reduce)': 'none'
      }
    },
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.decelerate
  }
})

// `medium` is the box as it was before sizes existed.
export const checkboxSizes = stylex.create({
  small: { height: unit.x3, width: unit.x3 },
  medium: { height: unit.x4, width: unit.x4 },
  large: { height: unit.x5, width: unit.x5 }
})

export const checkboxGroupStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x2
  }
})
