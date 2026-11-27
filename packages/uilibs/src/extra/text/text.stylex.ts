import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight } from '../../styles/tokens.stylex'

// The variant sets are in `styles/responsive.stylex.ts`, with the other sets that change per breakpoint.

export const textColorStyles = stylex.create({
  neutral: { color: colors.foregroundNeutral },
  'neutral-faded': { color: colors.foregroundNeutralFaded },
  positive: { color: colors.foregroundPositive },
  warning: { color: colors.foregroundWarning },
  critical: { color: colors.foregroundCritical },
  primary: { color: colors.foregroundPrimary },
  disabled: { color: colors.foregroundDisabled }
})

export const textWeightStyles = stylex.create({
  light: { fontWeight: fontWeight.light },
  regular: { fontWeight: fontWeight.regular },
  medium: { fontWeight: fontWeight.medium },
  semibold: { fontWeight: fontWeight.semibold },
  bold: { fontWeight: fontWeight.bold },
  extrabold: { fontWeight: fontWeight.extrabold },
  black: { fontWeight: fontWeight.black }
})

export const textAlignStyles = stylex.create({
  start: { textAlign: 'start' },
  center: { textAlign: 'center' },
  end: { textAlign: 'end' }
})

export const textStyles = stylex.create({
  decorationUnderline: { textDecorationLine: 'underline' },
  decorationLineThrough: { textDecorationLine: 'line-through' },
  wrapBalance: { textWrap: 'balance' },
  wrapNowrap: { whiteSpace: 'nowrap' },
  monospace: { fontFamily: fontFamily.monospace },
  numeric: { fontVariantNumeric: 'tabular-nums' },
  clamp: (value: number) => ({
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: value
  }),
  breakAll: { wordBreak: 'break-all' }
})
