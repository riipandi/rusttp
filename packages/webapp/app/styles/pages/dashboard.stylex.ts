import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

export const styles = stylex.create({
  headerStart: {
    display: 'flex',
    alignItems: 'center',
    gap: unit.x6
  },
  nav: {
    display: {
      default: 'none',
      '@media (min-width: 660px)': 'flex'
    },
    alignItems: 'center',
    gap: unit.x1
  },
  navCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded
  },
  navItem: {
    color: colors.foregroundNeutralFaded
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x10,
    paddingBlock: unit.x12
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
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 660px)': 'repeat(2, 1fr)',
      '@media (min-width: 900px)': 'repeat(4, 1fr)'
    },
    gap: unit.x6,
    margin: 0,
    paddingBlock: unit.x6,
    borderBlockWidth: 1,
    borderBlockStyle: 'solid',
    borderBlockColor: colors.borderNeutralFaded
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  summaryLabel: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2
  },
  summaryValue: {
    margin: 0,
    fontSize: fontSize.featured3,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x3
  },
  sectionTitle: {
    margin: 0,
    fontSize: fontSize.featured5,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em'
  },
  muted: {
    color: colors.foregroundNeutralFaded
  }
})
