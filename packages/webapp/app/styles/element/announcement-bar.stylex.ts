import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints, layoutSize } from '#/styles/constants.stylex'

export const styles = stylex.create({
  // A solid strip above the header. It scrolls away with the page; the header below stays sticky.
  root: {
    display: 'flex',
    boxSizing: 'border-box',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: unit.x2,
    rowGap: unit.x1,
    minHeight: unit.x10,
    paddingBlock: unit.x1,
    paddingInline: layoutSize.gutter,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    textAlign: 'center'
  },
  message: {
    margin: 0,
    textWrap: 'balance'
  },
  // The action borrows the strip's text color, so it reads on every tone; the hover tint is that
  // color at low alpha.
  action: {
    color: 'inherit',
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:disabled)': 'color-mix(in srgb, currentColor 16%, transparent)'
    },
    fontWeight: fontWeight.bold,
    textDecoration: 'underline',
    textUnderlineOffset: unit.x1,
    // Stays out of the way of the message on narrow screens.
    marginInlineStart: {
      default: 0,
      [breakpoints.medium]: unit.x1
    }
  }
})

export const tones = stylex.create({
  neutral: { backgroundColor: colors.foregroundNeutral, color: colors.backgroundPage },
  primary: { backgroundColor: colors.backgroundPrimary, color: colors.onBackgroundPrimary },
  positive: { backgroundColor: colors.backgroundPositive, color: colors.onBackgroundPositive },
  warning: { backgroundColor: colors.backgroundWarning, color: colors.onBackgroundWarning },
  critical: { backgroundColor: colors.backgroundCritical, color: colors.onBackgroundCritical }
})
