import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

// Kept in sync with ../meter/meter.stylex.ts — intentional duplication
// so both components stay independently styled but visually identical.

export const progressStyles = stylex.create({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: fontFamily.body,
    gap: unit.x3,
    width: '100%'
  },
  track: {
    alignItems: 'center',
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.full,
    display: 'flex',
    height: unit.x1,
    // Forced colors drop backgrounds: the track gets an edge and the fill a system color.
    outline: { default: 'none', '@media (forced-colors: active)': '1px solid CanvasText' },
    overflowX: 'hidden',
    position: 'relative',
    width: '100%'
  },
  indicator: {
    backgroundColor: {
      default: colors.backgroundPrimary,
      '@media (forced-colors: active)': 'Highlight'
    },
    height: '100%',
    transitionDuration: duration.fast,
    transitionProperty: { default: 'width', '@media (prefers-reduced-motion: reduce)': 'none' },
    transitionTimingFunction: easing.decelerate
  },
  label: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    lineHeight: fontLineHeight.body2
  },
  value: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: fontLineHeight.body2,
    marginLeft: 'auto'
  }
})
