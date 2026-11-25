import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit, zIndex } from 'uilibs/styles/tokens.stylex'
import { layoutSize } from '#/styles/constants.stylex'

// The shell every route shares. `container` is the one content width (header, page, footer line up);
// `center` is a single reading column for pages with nothing else on them (404, error).
export const styles = stylex.create({
  root: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  },
  container: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: layoutSize.page,
    marginInline: 'auto',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: unit.x4,
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
  center: {
    flex: 1,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: unit.x4,
    width: '100%',
    maxWidth: layoutSize.reading,
    marginInline: 'auto',
    padding: unit.x6
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x2,
    marginBlockStart: unit.x2
  },
  footer: {
    paddingBlock: unit.x6,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  }
})
