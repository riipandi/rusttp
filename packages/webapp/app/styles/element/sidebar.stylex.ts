import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import {
  container,
  duration,
  easing,
  fontSize,
  fontWeight,
  unit
} from 'uilibs/styles/tokens.stylex'
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
    // 16rem plus one step: the next container token (18rem) is a 32px jump.
    width: `calc(${container.xsmall} + ${unit.x4})`,
    height: '100dvh',
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'width',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    transitionTimingFunction: easing.standard,
    backgroundColor: colors.backgroundPage,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.borderNeutralFaded
  },
  // The icon rail: just wide enough for the items' 40px boxes between the nav's own padding.
  rootCollapsed: {
    width: unit.x16
  },
  // No divider under the header. The logo lines up with the icons below it (the header's inset plus
  // none, the nav's padding plus the item's own), and the trigger's box with the items' right edge.
  header: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 'none',
    height: unit.x14,
    paddingTop: unit.x1,
    paddingInlineStart: unit.x6,
    paddingInlineEnd: unit.x3
  },
  // The logo above the expand entry, both centered on the rail. Both longhands: a `paddingInline`
  // shorthand would lose to the header's own start and end padding, and the column would sit 6px
  // off the rail's center.
  headerCollapsed: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: unit.x1,
    height: 'auto',
    paddingTop: unit.x2,
    paddingInlineStart: 0,
    paddingInlineEnd: 0
  },
  // The collapse and expand triggers sit quieter than the nav they act on: the faded foreground
  // (the idle items' color, so the contrast is the same) until hover or focus lifts them.
  trigger: {
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral,
      ':focus-visible': colors.foregroundNeutral
    }
  },
  brand: {
    // The logo is sized in em, so this shrinks mark and wordmark together.
    fontSize: fontSize.body1
  },
  // The mark alone, in a box the size of the entry below it, so the two stack on one axis.
  brandCollapsed: {
    justifyContent: 'center',
    width: unit.x10,
    height: unit.x10
  },
  nav: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x5,
    flex: 1,
    // The only part that scrolls: between the two dividers.
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    padding: unit.x3
  },
  // The labels are gone, so the groups meet with a small step between them instead of a label's room.
  navCollapsed: {
    gap: unit.x2
  },
  // `auto`, not the separator's own 100%, which a side margin would push past the rail; the color
  // is the separator's own faded border.
  railSeparator: {
    width: 'auto',
    marginInline: unit.x2
  },
  // The collapsed rail's notification entry between the scrolling nav and the account strip; it stays put.
  notify: {
    flexShrink: 0,
    paddingInline: unit.x3,
    paddingBlockEnd: unit.x3
  },
  bell: {
    position: 'relative',
    display: 'inline-flex'
  },
  // The unread indicator: a dot on the bell's corner, ringed in the page color so it reads on top.
  dot: {
    position: 'absolute',
    top: `calc(-1 * ${unit.x0_5})`,
    insetInlineEnd: `calc(-1 * ${unit.x0_5})`,
    width: unit.x2,
    height: unit.x2,
    borderRadius: '50%',
    backgroundColor: colors.backgroundPrimary,
    boxShadow: `0 0 0 2px ${colors.backgroundPage}`
  },
  // With something unread the entry steps up from the idle gray to the full foreground; the dot on
  // the bell is the solid primary: the two together read as one state, the gray one as none.
  itemUnread: {
    color: colors.foregroundNeutral
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  groupLabel: {
    paddingInline: unit.x3,
    paddingBlockEnd: unit.x1,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1,
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  item: {
    justifyContent: 'flex-start',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    width: '100%',
    height: unit.x9,
    paddingInline: unit.x3
  },
  // The label is gone: the icon alone, centered in the 40px box.
  itemCollapsed: {
    justifyContent: 'center',
    paddingInline: 0
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
    justifyContent: 'space-between',
    gap: unit.x2,
    flexShrink: 0,
    height: unit.x16,
    minWidth: 0,
    // The avatar's center lines up with the nav icons' above it.
    paddingInline: unit.x4,
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colors.borderNeutralFaded
  },
  // Collapsed, the avatar is alone in the strip: centered on the rail.
  accountCollapsed: {
    justifyContent: 'center',
    paddingInline: 0
  }
})
