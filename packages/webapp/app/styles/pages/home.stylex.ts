import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '#/styles/constants.stylex'

// Spacing follows the viewport height (`dvh`, clamped), so the page is roomy on
// a tall screen and still fits a 720px-high laptop viewport without scrolling.
export const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'clamp(1.5rem, 6dvh, 4rem)',
    paddingBlock: 'clamp(1.5rem, 5dvh, 4rem)'
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: unit.x5
  },
  title: {
    margin: 0,
    maxWidth: '24ch',
    fontSize: {
      default: fontSize.featured1,
      [breakpoints.medium]: fontSize.headline3
    },
    fontWeight: fontWeight.bold,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    textWrap: 'balance'
  },
  lead: {
    margin: 0,
    maxWidth: '60ch',
    fontSize: fontSize.featured6,
    lineHeight: 1.6,
    color: colors.foregroundNeutralFaded,
    textWrap: 'pretty'
  },
  sectionTitle: {
    margin: 0,
    marginBlockEnd: unit.x2,
    fontSize: fontSize.featured5,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em'
  }
})
