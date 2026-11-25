import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { duration, radius, stroke, unit } from '../../styles/tokens.stylex'

export const linkStyles = stylex.create({
  root: {
    borderRadius: radius.small,
    cursor: 'pointer',
    outlineOffset: stroke.ring2,
    transitionDuration: duration.fast,
    transitionProperty: 'color, text-decoration-thickness'
  },
  // A glyph turns the anchor into a row; a link with none stays inline, so it wraps with its text.
  withGlyph: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: unit.x1
  }
})

export const linkColors = stylex.create({
  primary: { color: colors.foregroundPrimary },
  neutral: { color: colors.foregroundNeutral },
  critical: { color: colors.foregroundCritical },
  positive: { color: colors.foregroundPositive },
  warning: { color: colors.foregroundWarning },
  inherit: { color: 'inherit' }
})

// The router sets `aria-current="page"` on the link of the route that is open (`data-status` too).
export const linkVariants = stylex.create({
  underline: {
    textDecorationColor: 'currentColor',
    textDecorationLine: 'underline',
    textDecorationThickness: {
      default: '1px',
      ':hover': '2px',
      '[aria-current="page"]': '2px'
    },
    textUnderlineOffset: '0.25em'
  },
  plain: {
    textDecorationLine: {
      default: 'none',
      ':hover': 'underline',
      '[aria-current="page"]': 'underline'
    },
    textDecorationThickness: '1px',
    textUnderlineOffset: '0.25em'
  }
})
