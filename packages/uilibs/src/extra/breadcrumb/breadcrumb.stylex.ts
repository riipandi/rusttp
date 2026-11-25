import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { unit } from '../../styles/tokens.stylex'
import { fontFamily, fontSize } from '../../styles/tokens.stylex'
import { duration } from '../../styles/tokens.stylex'

export const breadcrumbStyles = stylex.create({
  list: {
    alignItems: 'center',
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    gap: unit.x1_5,
    listStyle: 'none',
    margin: 0,
    overflowWrap: 'break-word',
    padding: 0
  },
  item: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: unit.x1
  },
  link: {
    color: {
      default: 'inherit',
      ':hover': colors.foregroundNeutral
    },
    textDecoration: 'none',
    transitionDuration: duration.fast,
    transitionProperty: 'color'
  },
  // `primary`: the links take the primary color; the current page keeps the text color.
  linkPrimary: {
    color: colors.foregroundPrimary,
    textDecoration: { default: 'none', ':hover': 'underline' }
  },
  page: {
    color: colors.foregroundNeutral
  },
  separator: {
    alignItems: 'center',
    display: 'flex'
  },
  ellipsis: {
    alignItems: 'center',
    display: 'flex',
    height: unit.x5,
    justifyContent: 'center',
    width: unit.x5
  }
})
