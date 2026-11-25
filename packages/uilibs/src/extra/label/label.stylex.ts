import * as stylex from '@stylexjs/stylex'
import { fontWeight } from '../../styles/tokens.stylex'
import { unit } from '../../styles/tokens.stylex'

export const labelStyles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: fontWeight.medium,
    gap: unit.x2,
    userSelect: 'none'
  }
})
