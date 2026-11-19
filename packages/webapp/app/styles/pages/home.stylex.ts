import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

export const styles = stylex.create({
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: unit.x6,
    paddingBlock: {
      default: unit.x16,
      '@media (min-width: 900px)': '7rem'
    }
  },
  title: {
    margin: 0,
    maxWidth: '18ch',
    fontSize: {
      default: fontSize.featured1,
      '@media (min-width: 660px)': fontSize.headline3,
      '@media (min-width: 900px)': fontSize.headline2
    },
    fontWeight: fontWeight.bold,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    textWrap: 'balance'
  },
  lead: {
    margin: 0,
    maxWidth: '56ch',
    fontSize: fontSize.featured6,
    lineHeight: 1.6,
    color: colors.foregroundNeutralFaded,
    textWrap: 'pretty'
  },
  stack: {
    paddingBlockEnd: unit.x20
  },
  sectionTitle: {
    margin: 0,
    marginBlockEnd: unit.x4,
    fontSize: fontSize.featured5,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em'
  }
})
