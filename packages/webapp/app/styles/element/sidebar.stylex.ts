import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

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
    gap: { default: unit.x3, [narrow]: unit.x2 },
    flexShrink: 0,
    width: { default: '16rem', [narrow]: '100%' },
    height: { default: '100dvh', [narrow]: 'auto' },
    position: { default: 'sticky', [narrow]: 'static' },
    top: 0,
    padding: unit.x3,
    paddingBlockStart: { default: 0, [narrow]: unit.x3 },
    backgroundColor: colors.backgroundPage,
    borderInlineEndWidth: { default: 1, [narrow]: 0 },
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.borderNeutralFaded,
    borderBlockEndWidth: { default: 0, [narrow]: 1 },
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  // On wide screens the brand is a header strip: its divider runs edge to edge and the logo lines up
  // with the icons below (sidebar padding plus the item's own). On narrow ones it is the top row's
  // left half.
  brand: {
    boxSizing: 'border-box',
    display: 'flex',
    flex: { default: 'none', [narrow]: 1 },
    // The logo is sized in em, so this shrinks mark and wordmark together.
    fontSize: fontSize.body1,
    height: { default: unit.x12, [narrow]: unit.x10 },
    marginInline: { default: `calc(-1 * ${unit.x3})`, [narrow]: 0 },
    paddingInline: { default: unit.x6, [narrow]: unit.x2 },
    borderBlockEndWidth: { default: 1, [narrow]: 0 },
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  nav: {
    display: 'flex',
    flexDirection: { default: 'column', [narrow]: 'row' },
    flexWrap: 'wrap',
    gap: { default: unit.x4, [narrow]: unit.x0_5 },
    flex: { default: 1, [narrow]: 'none' },
    order: { default: 0, [narrow]: 2 },
    width: { default: 'auto', [narrow]: '100%' }
  },
  // On narrow screens the groups and lists dissolve into one wrapping row of items and their labels are hidden.
  group: {
    display: { default: 'flex', [narrow]: 'contents' },
    flexDirection: 'column',
    gap: unit.x1
  },
  groupLabel: {
    display: { default: 'block', [narrow]: 'none' },
    paddingInline: unit.x3,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium
  },
  list: {
    display: { default: 'flex', [narrow]: 'contents' },
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
