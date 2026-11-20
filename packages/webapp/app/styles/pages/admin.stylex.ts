import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '#/styles/constants.stylex'

export const styles = stylex.create({
  root: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: { default: 'row', [breakpoints.compact]: 'column' },
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  // Below the compact breakpoint the sidebar is gone and this bar stands in: the menu trigger, the
  // brand centered, and the notification trigger, in three equal-weight zones.
  topbar: {
    display: { default: 'none', [breakpoints.compact]: 'grid' },
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: unit.x2,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxSizing: 'border-box',
    height: unit.x14,
    paddingInline: 'clamp(1.5rem, 4vw, 3rem)',
    backgroundColor: colors.backgroundPage,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  brand: {
    justifySelf: 'center'
  },
  // The bell is the last item, so its glyph, not its 36px box, lines up with the content edge.
  notify: {
    justifySelf: 'end',
    marginInlineEnd: `calc(-1 * ${unit.x2})`
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
