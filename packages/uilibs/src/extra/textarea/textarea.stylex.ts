import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { unit } from '../../styles/tokens.stylex'
import { fontSize, fontLineHeight } from '../../styles/tokens.stylex'

/** Minimum height and type of a textarea; the single-line scale of `controlSizes` does not apply. */
export const textareaSizes = stylex.create({
  small: {
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    minHeight: unit.x14,
    paddingInline: unit.x3
  },
  medium: {
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    minHeight: unit.x16,
    paddingInline: unit.x3
  },
  large: {
    fontSize: fontSize.body1,
    lineHeight: fontLineHeight.body1,
    minHeight: unit.x18,
    paddingInline: unit.x4
  }
})

// The box and state model come from `controlBase`.
export const textareaStyles = stylex.create({
  root: {
    paddingBlock: unit.x2,
    resize: 'vertical',
    width: '100%',
    '::placeholder': { color: colors.foregroundNeutralFaded }
  },
  autoResize: {
    height: 'auto',
    overflow: 'hidden',
    resize: 'none'
  }
})
