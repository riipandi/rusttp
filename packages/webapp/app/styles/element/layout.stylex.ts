import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit, zIndex } from 'uilibs/styles/tokens.stylex'
import { layoutSize } from '#/styles/constants.stylex'

// The shell every route shares. `Container` at `layoutSize.page` is the one content width (header,
// page, footer line up) and `gutter` its inset.
export const styles = stylex.create({
  root: {
    minHeight: '100dvh',
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  },
  gutter: {
    paddingInline: layoutSize.gutter
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: zIndex.sticky,
    backgroundColor: colors.backgroundPage,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderNeutralFaded
  },
  headerRow: {
    height: unit.x14
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: unit.x2,
    color: colors.foregroundNeutral,
    textDecoration: 'none',
    fontSize: fontSize.featured6,
    fontWeight: fontWeight.bold
  },
  main: {
    flex: 1
  },
  footer: {
    paddingBlock: unit.x6,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  }
})
