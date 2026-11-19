import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { unit } from 'uilibs/styles/tokens.stylex'

const breakpoints = { narrow: '@media (max-width: 767px)' }

// The admin sidebar: a column on wide screens, a block above the page on narrow ones.
export const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x6,
    flexShrink: 0,
    width: { default: '16rem', [breakpoints.narrow]: '100%' },
    height: { default: '100dvh', [breakpoints.narrow]: 'auto' },
    position: { default: 'sticky', [breakpoints.narrow]: 'static' },
    top: 0,
    padding: unit.x4,
    backgroundColor: colors.backgroundPage,
    borderInlineEndWidth: { default: 1, [breakpoints.narrow]: 0 },
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.borderNeutralFaded,
    borderBlockEndWidth: { default: 0, [breakpoints.narrow]: 1 },
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  nav: {
    display: 'flex',
    flexDirection: { default: 'column', [breakpoints.narrow]: 'row' },
    flexWrap: 'wrap',
    gap: unit.x1,
    flex: 1
  },
  item: {
    justifyContent: { default: 'flex-start', [breakpoints.narrow]: 'center' },
    width: { default: '100%', [breakpoints.narrow]: 'auto' }
  },
  itemCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded
  },
  itemIdle: {
    color: colors.foregroundNeutralFaded
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-start'
  }
})
