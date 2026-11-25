import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke, unit } from '../../styles/tokens.stylex'

export const separatorStyles = stylex.create({
  root: {
    backgroundColor: colors.borderNeutralFaded,
    flexShrink: 0
  }
})

export const separatorColors = stylex.create({
  'neutral-faded': { backgroundColor: colors.borderNeutralFaded },
  neutral: { backgroundColor: colors.borderNeutral }
})

// An inset separator stops short of the edges of its container.
export const separatorInsets = stylex.create({
  horizontal: { marginInline: unit.x3, width: `calc(100% - 2 * ${unit.x3})` },
  vertical: { marginBlock: unit.x3 }
})

export const separatorOrientations = stylex.create({
  horizontal: {
    height: stroke.ring1,
    width: '100%'
  },
  vertical: {
    alignSelf: 'stretch',
    width: stroke.ring1
  }
})
