import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const closeButtonStyles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutralFaded
    },
    borderRadius: radius.small,
    borderStyle: 'none',
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral
    },
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    height: unit.x7,
    justifyContent: 'center',
    padding: 0,
    width: unit.x7
  }
})
