import * as stylex from '@stylexjs/stylex'
import { fontFamily, fontSize } from '../../styles/tokens.stylex'
import { unit } from '../../styles/tokens.stylex'

// Raw `@media` strings below mirror the `viewport` values in `styles/tokens.stylex.ts` (medium 660, large 900,
// xlarge 1280): `breakpoints` is a set of closed ranges, and StyleX 0.19 only inlines media consts declared in the
// same file, so an open-ended query is written out.

export const paginationStyles = stylex.create({
  nav: {
    display: 'flex',
    fontFamily: fontFamily.body,
    justifyContent: 'center',
    marginInline: 'auto',
    width: '100%'
  },
  content: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x0_5,
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  previous: {
    paddingLeft: unit.x1_5
  },
  next: {
    paddingRight: unit.x1_5
  },
  linkText: {
    display: {
      default: 'none',
      '@media (min-width: 660px)': 'block'
    }
  },
  ellipsis: {
    alignItems: 'center',
    display: 'flex',
    fontSize: fontSize.body2,
    height: unit.x8,
    justifyContent: 'center',
    width: unit.x8
  }
})
