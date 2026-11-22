import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

export const switchStyles = stylex.create({
  root: {
    backgroundColor: {
      default: colors.borderControl,
      '[data-checked]': colors.backgroundPrimary,
      '[data-invalid]': colors.backgroundCritical,
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
    // Invisible expanded hit area (larger touch target).
    '::after': {
      content: '""',
      insetBlock: `calc(-1 * ${unit.x2})`,
      insetInline: `calc(-1 * ${unit.x3})`,
      position: 'absolute'
    }
  },
  thumb: {
    backgroundColor: {
      default: colors.backgroundPage,
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
  md: {
    height: unit.x5,
    width: unit.x9
  },
  sm: {
    height: unit.x4,
    width: unit.x7
  },
  lg: {
    height: unit.x6,
    width: unit.x12
  }
})

export const switchThumbSizes = stylex.create({
  md: {
    height: unit.x4,
    transform: {
      default: 'translateX(0)',
      '[data-checked]': `translateX(${unit.x4})`
    },
    width: unit.x4
  },
  sm: {
    height: unit.x3,
    transform: {
      default: 'translateX(0)',
      '[data-checked]': `translateX(${unit.x3})`
    },
    width: unit.x3
  },
  lg: {
    height: unit.x5,
    transform: {
      default: 'translateX(0)',
      '[data-checked]': `translateX(${unit.x6})`
    },
    width: unit.x5
  }
})
