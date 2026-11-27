import * as stylex from '@stylexjs/stylex'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily } from '../../styles/tokens.stylex'

export const checkboxStyles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      default: colors.backgroundPage,
      '[data-checked]:not([data-disabled])': colors.backgroundPrimary,
      '[data-indeterminate]:not([data-disabled])': colors.backgroundPrimary,
      ':disabled': colors.backgroundNeutral,
      '[data-disabled]': colors.backgroundNeutral
    },
    borderColor: {
      default: colors.borderControl,
      '[data-checked]:not([data-disabled])': colors.backgroundPrimary,
      '[data-indeterminate]:not([data-disabled])': colors.backgroundPrimary,
      '[data-invalid]': colors.borderCritical,
      ':disabled': colors.borderDisabled,
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
    justifyContent: 'center'
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
