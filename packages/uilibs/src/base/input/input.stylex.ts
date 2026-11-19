import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight } from '../../styles/tokens.stylex'
import { unit } from '../../styles/tokens.stylex'

// The box, state model, and size come from `controlBase` and `controlSizes`.
export const inputStyles = stylex.create({
  root: {
    width: '100%',
    '::placeholder': { color: colors.foregroundNeutralFaded },
    // type="file": render the browser's picker button as quiet inline text,
    // vertically centered inside the fixed-height control.
    '::file-selector-button': {
      backgroundColor: 'transparent',
      borderStyle: 'none',
      color: colors.foregroundNeutral,
      fontFamily: fontFamily.body,
      fontSize: 'inherit',
      fontWeight: fontWeight.medium,
      height: '100%',
      marginInlineEnd: unit.x3,
      padding: 0
    }
  }
})
