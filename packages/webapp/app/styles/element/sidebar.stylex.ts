import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontWeight, unit } from 'uilibs/styles/tokens.stylex'

const narrow = '@media (max-width: 767px)'

// The admin sidebar: brand, navigation, account. A column beside the page on wide screens; on
// narrow ones the brand and account share a row above the navigation.
export const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: { default: 'column', [narrow]: 'row' },
    flexWrap: { default: 'nowrap', [narrow]: 'wrap' },
    alignItems: { default: 'stretch', [narrow]: 'center' },
    gap: { default: unit.x4, [narrow]: unit.x2 },
    flexShrink: 0,
    width: { default: '18rem', [narrow]: '100%' },
    height: { default: '100dvh', [narrow]: 'auto' },
    position: { default: 'sticky', [narrow]: 'static' },
    top: 0,
    padding: unit.x3,
    backgroundColor: colors.backgroundPage,
    borderInlineEndWidth: { default: 1, [narrow]: 0 },
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.borderNeutralFaded,
    borderBlockEndWidth: { default: 0, [narrow]: 1 },
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  brand: {
    flex: { default: 'none', [narrow]: 1 },
    height: unit.x10,
    paddingInline: unit.x2
  },
  nav: {
    flex: { default: 1, [narrow]: 'none' },
    order: { default: 0, [narrow]: 2 },
    width: { default: 'auto', [narrow]: '100%' }
  },
  list: {
    display: 'flex',
    flexDirection: { default: 'column', [narrow]: 'row' },
    flexWrap: 'wrap',
    gap: unit.x0_5,
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  item: {
    justifyContent: 'flex-start',
    width: { default: '100%', [narrow]: 'auto' }
  },
  itemCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded,
    fontWeight: fontWeight.medium
  },
  itemIdle: {
    color: colors.foregroundNeutralFaded
  },
  account: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    paddingBlockStart: { default: unit.x3, [narrow]: 0 },
    borderBlockStartWidth: { default: 1, [narrow]: 0 },
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colors.borderNeutralFaded
  }
})
