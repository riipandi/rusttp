import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { container, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '#/styles/constants.stylex'

// The admin sidebar: a header strip, a navigation that scrolls, and an account footer. On wide
// screens it is a column beside the page whose two dividers run edge to edge; on narrow ones the
// brand and the account share a top row above a single row of items that scrolls sideways, so a long
// menu never grows the bar.
export const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: { default: 'column', [breakpoints.compact]: 'row' },
    flexWrap: { default: 'nowrap', [breakpoints.compact]: 'wrap' },
    alignItems: { default: 'stretch', [breakpoints.compact]: 'center' },
    gap: { default: 0, [breakpoints.compact]: unit.x2 },
    flexShrink: 0,
    width: { default: container.xsmall, [breakpoints.compact]: '100%' },
    height: { default: '100dvh', [breakpoints.compact]: 'auto' },
    position: { default: 'sticky', [breakpoints.compact]: 'static' },
    top: 0,
    padding: { default: 0, [breakpoints.compact]: unit.x3 },
    backgroundColor: colors.backgroundPage,
    borderInlineEndWidth: { default: 1, [breakpoints.compact]: 0 },
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.borderNeutralFaded,
    borderBlockEndWidth: { default: 0, [breakpoints.compact]: 1 },
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  // The logo lines up with the icons below it: the nav's padding plus the item's own.
  brand: {
    boxSizing: 'border-box',
    display: 'flex',
    flex: { default: 'none', [breakpoints.compact]: 1 },
    // The logo is sized in em, so this shrinks mark and wordmark together.
    fontSize: fontSize.body1,
    height: { default: unit.x12, [breakpoints.compact]: unit.x10 },
    paddingInline: { default: unit.x6, [breakpoints.compact]: unit.x2 },
    borderBlockEndWidth: { default: 1, [breakpoints.compact]: 0 },
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  nav: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: { default: 'column', [breakpoints.compact]: 'row' },
    flexWrap: 'nowrap',
    gap: { default: unit.x4, [breakpoints.compact]: unit.x0_5 },
    flex: { default: 1, [breakpoints.compact]: 'none' },
    // The only part that scrolls: between the two dividers on wide screens, sideways on narrow ones.
    minHeight: 0,
    overflowY: { default: 'auto', [breakpoints.compact]: 'hidden' },
    overflowX: { default: 'hidden', [breakpoints.compact]: 'auto' },
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    order: { default: 0, [breakpoints.compact]: 2 },
    padding: { default: unit.x3, [breakpoints.compact]: 0 },
    width: { default: 'auto', [breakpoints.compact]: '100%' }
  },
  // On narrow screens the groups and lists dissolve into the nav's row and the labels are hidden.
  group: {
    display: { default: 'flex', [breakpoints.compact]: 'contents' },
    flexDirection: 'column',
    gap: unit.x1
  },
  groupLabel: {
    display: { default: 'block', [breakpoints.compact]: 'none' },
    paddingInline: unit.x3,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium
  },
  list: {
    display: { default: 'flex', [breakpoints.compact]: 'contents' },
    flexDirection: 'column',
    gap: unit.x0_5,
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  item: {
    justifyContent: 'flex-start',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    width: { default: '100%', [breakpoints.compact]: 'auto' }
  },
  itemCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded,
    fontWeight: fontWeight.medium
  },
  itemIdle: {
    color: colors.foregroundNeutralFaded
  },
  // The counterpart of the header strip: the same height, its divider edge to edge.
  account: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    height: { default: unit.x14, [breakpoints.compact]: 'auto' },
    minWidth: 0,
    paddingInline: { default: unit.x3, [breakpoints.compact]: 0 },
    borderBlockStartWidth: { default: 1, [breakpoints.compact]: 0 },
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colors.borderNeutralFaded
  }
})
