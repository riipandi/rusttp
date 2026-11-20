import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { container, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '#/styles/constants.stylex'

// The admin sidebar: a header strip, a navigation that scrolls, and an account footer, a column
// beside the page whose two dividers run edge to edge. Below the compact breakpoint it is gone: the
// top bar and its navigation sheet take over (`routes/admin/-topbar.tsx`).
export const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: { default: 'flex', [breakpoints.compact]: 'none' },
    flexDirection: 'column',
    flexShrink: 0,
    width: container.xsmall,
    height: '100dvh',
    position: 'sticky',
    top: 0,
    backgroundColor: colors.backgroundPage,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.borderNeutralFaded
  },
  // The logo lines up with the icons below it: the nav's padding plus the item's own.
  brand: {
    boxSizing: 'border-box',
    display: 'flex',
    flex: 'none',
    // The logo is sized in em, so this shrinks mark and wordmark together.
    fontSize: fontSize.body1,
    height: unit.x12,
    paddingInline: unit.x6,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  nav: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x4,
    flex: 1,
    // The only part that scrolls: between the two dividers.
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    padding: unit.x3
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  groupLabel: {
    paddingInline: unit.x3,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium
  },
  list: {
    display: 'flex',
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
    width: '100%'
  },
  itemCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded,
    fontWeight: fontWeight.medium
  },
  itemIdle: {
    color: colors.foregroundNeutralFaded
  },
  // The counterpart of the header strip: its divider edge to edge, tall enough for a 48px row with
  // 8px above and below.
  account: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    height: unit.x16,
    minWidth: 0,
    paddingInline: unit.x3,
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colors.borderNeutralFaded
  }
})
