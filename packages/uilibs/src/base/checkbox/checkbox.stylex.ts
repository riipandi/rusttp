import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily } from '../../styles/tokens.stylex'

export const checkboxStyles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      default: colors.backgroundPage,
      '[data-checked]': colors.backgroundPrimary,
      '[data-indeterminate]': colors.backgroundPrimary
    },
    borderColor: {
      default: colors.borderControl,
      '[data-checked]': colors.backgroundPrimary,
      '[data-indeterminate]': colors.backgroundPrimary,
      '[data-invalid]': colors.borderCritical
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
    color: colors.onBackgroundPrimary,
    display: 'flex',
    justifyContent: 'center'
  }
})

// `md` is the box as it was before sizes existed.
export const checkboxSizes = stylex.create({
  sm: { height: unit.x3, width: unit.x3 },
  md: { height: unit.x4, width: unit.x4 },
  lg: { height: unit.x5, width: unit.x5 }
})

export const checkboxGroupStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x2
  }
})
