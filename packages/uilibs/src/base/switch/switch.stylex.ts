import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

export const switchStyles = stylex.create({
  root: {
    backgroundColor: {
      default: colors.borderControl,
      '[data-checked]:not([data-disabled])': colors.backgroundPrimary,
      '[data-invalid]': colors.backgroundCritical,
      ':disabled': colors.backgroundNeutral,
      '[data-disabled]': colors.backgroundNeutral,
      // Forced colors: the track is an outlined box that fills with Highlight when on.
      '@media (forced-colors: active)': { default: 'Canvas', '[data-checked]': 'Highlight' }
    },
    borderColor: { default: 'transparent', '@media (forced-colors: active)': 'CanvasText' },
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: { default: 0, '@media (forced-colors: active)': stroke.ring1 },
    display: 'inline-flex',
    flexShrink: 0,
    padding: unit.x0_5,
    position: 'relative',
    // Invisible expanded hit area (larger touch target). Block axis only: every track is wider than
    // the 24px minimum, and an inline overhang widens the page when the switch sits at its edge.
    '::after': {
      content: '""',
      insetBlock: `calc(-1 * ${unit.x2})`,
      position: 'absolute'
    }
  },
  thumb: {
    backgroundColor: {
      default: colors.backgroundPage,
      '[data-disabled]': colors.foregroundDisabled,
      '@media (forced-colors: active)': 'CanvasText'
    },
    borderRadius: radius.full,
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'transform',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    transitionTimingFunction: easing.standard
  }
})

export const switchRootSizes = stylex.create({
  medium: {
    height: unit.x5,
    width: unit.x9
  },
  small: {
    height: unit.x4,
    width: unit.x7
  },
  large: {
    height: unit.x6,
    width: unit.x12
  }
})

export const switchThumbSizes = stylex.create({
  medium: {
    height: unit.x4,
    transform: {
      default: 'translateX(0)',
      '[data-checked]': {
        default: `translateX(${unit.x4})`,
        ':dir(rtl)': `translateX(calc(-1 * ${unit.x4}))`
      }
    },
    width: unit.x4
  },
  small: {
    height: unit.x3,
    transform: {
      default: 'translateX(0)',
      '[data-checked]': {
        default: `translateX(${unit.x3})`,
        ':dir(rtl)': `translateX(calc(-1 * ${unit.x3}))`
      }
    },
    width: unit.x3
  },
  large: {
    height: unit.x5,
    transform: {
      default: 'translateX(0)',
      '[data-checked]': {
        default: `translateX(${unit.x6})`,
        ':dir(rtl)': `translateX(calc(-1 * ${unit.x6}))`
      }
    },
    width: unit.x5
  }
})
