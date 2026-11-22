import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { container } from '../../styles/tokens.stylex'
import { fontFamily, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { stroke, unit } from '../../styles/tokens.stylex'

// Raw `@media` strings below mirror the `viewport` values in `styles/tokens.stylex.ts` (medium 660, large 900,
// xlarge 1280): `breakpoints` is a set of closed ranges, and StyleX 0.19 only inlines media consts declared in the
// same file, so an open-ended query is written out.

/**
 * Key-value rows with hairline separators.
 *
 * Mobile: single column; the term carries the row's top border (skipped on
 * the first row). From 660px: two columns — terms capped at
 * `min(50%, container.medium)`, details auto-sizing — and the separator
 * moves to the details so the line spans both columns; the second child (the
 * first details) skips it to keep the first row clean. The last row closes
 * with a bottom border so the list also reads well standalone.
 *
 * Border widths and styles stay constant (only colors flip between the
 * hairline color and transparent): separators can never shift the layout,
 * and there is deliberately no column gap so the term and details borders
 * meet into one continuous line per row.
 */
export const descriptionListStyles = stylex.create({
  root: {
    display: 'grid',
    fontFamily: fontFamily.body,
    fontSize: { default: fontSize.body1, '@media (min-width: 660px)': fontSize.body2 },
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 660px)': `min(50%, ${container.medium}) auto`
    },
    lineHeight: { default: fontLineHeight.body1, '@media (min-width: 660px)': fontLineHeight.body2 }
  },
  term: {
    borderBottomColor: {
      default: 'transparent',
      ':last-of-type': {
        default: 'transparent',
        '@media (min-width: 660px)': colors.borderNeutralFaded
      }
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1,
    borderTopColor: {
      default: colors.borderNeutralFaded,
      ':first-child': 'transparent'
    },
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1,
    color: colors.foregroundNeutralFaded,
    gridColumnStart: 1,
    paddingBlockEnd: {
      default: 0,
      '@media (min-width: 660px)': unit.x3
    },
    paddingBlockStart: unit.x3
  },
  details: {
    borderBottomColor: {
      default: 'transparent',
      ':last-child': colors.borderNeutralFaded
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1,
    borderTopColor: {
      default: 'transparent',
      '@media (min-width: 660px)': {
        default: colors.borderNeutralFaded,
        ':nth-child(2)': 'transparent'
      }
    },
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1,
    color: colors.foregroundNeutral,
    paddingBlockEnd: unit.x3,
    paddingBlockStart: {
      default: unit.x1,
      '@media (min-width: 660px)': unit.x3
    }
  }
})
