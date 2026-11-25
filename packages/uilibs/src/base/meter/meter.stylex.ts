import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

// Kept in sync with ../progress/progress.stylex.ts — intentional duplication
// so both components stay independently styled but visually identical.

export const meterStyles = stylex.create({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: fontFamily.body,
    gap: unit.x3,
    width: '100%'
  },
  track: {
    alignItems: 'center',
    backgroundColor: colors.backgroundTrack,
    borderRadius: radius.full,
    display: 'flex',
    // Forced colors drop backgrounds: the track gets an edge and the fill a system color.
    outline: { default: 'none', '@media (forced-colors: active)': '1px solid CanvasText' },
    overflowX: 'hidden',
    position: 'relative',
    width: '100%'
  },
  indicator: {
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

// The fill by role; forced colors give every role the system highlight.
const fill = (color: string) => ({
  backgroundColor: { default: color, '@media (forced-colors: active)': 'Highlight' }
})

export const meterColors = stylex.create({
  neutral: fill(colors.foregroundNeutralFaded),
  primary: fill(colors.backgroundPrimary),
  positive: fill(colors.backgroundPositive),
  warning: fill(colors.backgroundWarning),
  critical: fill(colors.backgroundCritical)
})

// `md` is the bar as it was before sizes existed.
export const meterSizes = stylex.create({
  sm: { height: unit.x0_5 },
  md: { height: unit.x1 }
})
