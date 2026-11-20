import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '../constants.stylex'

export const styles = stylex.create({
  root: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: { default: 'row', [breakpoints.narrow]: 'column' },
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x10,
    padding: 'clamp(1.5rem, 4vw, 3rem)'
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  title: {
    margin: 0,
    fontSize: fontSize.featured2,
    fontWeight: fontWeight.bold,
    lineHeight: 1.15,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: 0,
    color: colors.foregroundNeutralFaded
  }
})
