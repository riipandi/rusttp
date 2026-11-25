import * as stylex from '@stylexjs/stylex'
import { colors } from '../styles/colors.stylex'

export const themeScopeStyles = stylex.create({
  // A scope paints its own page: a dark sidebar on a light page needs the dark surface and text.
  root: {
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  }
})

/** `color-scheme` follows the mode, so native scrollbars and form widgets match the tokens. */
export const themeScopeSchemes = stylex.create({
  dark: { colorScheme: 'dark' },
  light: { colorScheme: 'light' }
})
