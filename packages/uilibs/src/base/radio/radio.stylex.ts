import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const radioStyles = stylex.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2
  },
  item: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPage,
    borderColor: {
      default: colors.borderControl,
      '[data-checked]:not([data-disabled])': colors.backgroundPrimary,
      '[data-invalid]:not([data-disabled])': colors.borderCritical,
      '[data-disabled]': colors.borderDisabled
    },
    borderRadius: radius.full,
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
    backgroundColor: {
      default: colors.backgroundPrimary,
      '[data-disabled]': colors.foregroundDisabled
    },
    borderRadius: radius.full,
    display: 'block'
  }
})

// `medium` is the circle as it was before sizes existed; the dot is half of it.
export const radioSizes = stylex.create({
  small: { height: unit.x3, width: unit.x3 },
  medium: { height: unit.x4, width: unit.x4 },
  large: { height: unit.x5, width: unit.x5 }
})

export const radioIndicatorSizes = stylex.create({
  small: { height: unit.x1_5, width: unit.x1_5 },
  medium: { height: unit.x2, width: unit.x2 },
  large: {
    height: `calc(${unit.x2} + ${unit.x0_5})`,
    width: `calc(${unit.x2} + ${unit.x0_5})`
  }
})
