import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { container, duration, easing } from 'uilibs/styles/tokens.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { motion } from '#/styles/constants.stylex'

// The admin sidebar: a header strip, a navigation that scrolls, and an account footer, a column
// beside the page whose two dividers run edge to edge. Below the compact breakpoint it is not
// rendered: the top bar and its navigation sheet take over (`routes/admin/route.tsx`).
export const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    // 16rem plus a half step (264px): the next container token (18rem) is a 32px jump.
    width: `calc(${container.xsmall} + ${unit.x2})`,
    height: '100dvh',
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
    transitionDuration: duration.slow,
    transitionProperty: {
      default: 'width',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard,
    // Only the width moves, so let the browser keep the rest of the page out of each frame's paint.
    willChange: 'width',
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
    flex: 'none',
    height: unit.x14,
    paddingTop: unit.x1,
    position: 'relative',
    // 22px: the logo's center lands on the icon column (x=32), which is also its center in the rail.
    paddingInlineStart: `calc(${unit.x6} - ${unit.x0_5})`
  },
  // The collapse and expand triggers sit quieter than the nav they act on: the faded foreground
  // (the idle items' color, so the contrast is the same) until hover or focus lifts them.
  // The toggle is anchored to the sidebar's end edge, so it travels with the width as it animates;
  // in the rail its 32px box starts 16px in, centered on the icon column.
  trigger: {
    position: 'absolute',
    insetBlockStart: `calc(50% + ${unit.x0_5})`,
    insetInlineEnd: unit.x3,
    transform: 'translateY(-50%)',
    transitionDuration: duration.slow,
    transitionProperty: {
      default: 'inset-inline-end, background-color, color',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard,
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral,
      ':focus-visible': colors.foregroundNeutral
    }
  },
  // 15px: the rail is 64px wide and its 1px end border is inside the box, so the button starts at 16.
  triggerRail: {
    insetInlineEnd: `calc(${unit.x4} - 1px)`
  },
  brand: {
    // The logo is sized in em, so this shrinks mark and wordmark together.
    fontSize: fontSize.body1
  },
  // The wordmark fades (the aside clips it as the width closes); it never unmounts.
  wordmark: {
    whiteSpace: 'nowrap',
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  // In the rail the logo is the header's face: it gives way to the expand icon while the header is
  // hovered, or the toggle has keyboard focus (a pointer click leaves focus on the button, which
  // must not hold the icon).
  logoRail: {
    display: 'flex',
    opacity: {
      default: 1,
      [stylex.when.ancestor(':hover')]: 0,
      [stylex.when.ancestor(':has(:focus-visible)')]: 0
    },
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  // The two toggle icons share one cell and crossfade: close while expanded, open on hover in the rail.
  swap: {
    display: 'grid',
    placeItems: 'center'
  },
  swapClose: {
    gridArea: '1 / 1',
    display: 'flex',
    opacity: 1,
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  swapOpen: {
    gridArea: '1 / 1',
    display: 'flex',
    opacity: 0,
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  swapOpenRail: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover')]: 1,
      [stylex.when.ancestor(':has(:focus-visible)')]: 1
    }
  },
  // The search-like command bar trigger, between the header and the navigation.
  search: {
    flexShrink: 0,
    paddingInline: unit.x3,
    paddingBlockEnd: unit.x1
  },
  // The trigger above it already steps down, so the navigation starts without extra top padding.
  navUnderSearch: {
    paddingBlockStart: unit.x2
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
  // Text that leaves the rail fades while the width closes over it; it is never unmounted,
  // so the row's layout (and the icon in it) stays put.
  label: {
    overflow: 'hidden',
    textOverflow: 'clip',
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  faded: {
    opacity: 0
  },
  // The group label's row folds from its height to none (grid rows 1fr → 0fr animate),
  // so the items below glide up instead of jumping.
  groupLabelRow: {
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionDuration: duration.slow,
    transitionProperty: {
      default: 'grid-template-rows',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  groupLabelRowFolded: {
    gridTemplateRows: '0fr'
  },
  // The rail's group break: a short line centered in the gap above the group, faded in when the
  // labels are gone.
  rule: {
    position: 'absolute',
    top: `calc(${unit.x5} / -2)`,
    insetInline: unit.x2,
    height: 1,
    backgroundColor: colors.borderNeutralFaded,
    opacity: 0,
    transitionDuration: duration.slow,
    transitionProperty: {
      default: 'opacity',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  ruleShown: {
    opacity: 1
  },
  // The space the rail keeps for the bell between the scrolling nav and the account strip: 36px for
  // the bell and the 12px step below it. It folds to nothing expanded, with the width's timing, so
  // the nav grows and shrinks in step with the bell's travel instead of jumping.
  notifyRoom: {
    flexShrink: 0,
    height: 0,
    transitionDuration: duration.slow,
    transitionProperty: {
      default: 'height',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  notifyRoomOpen: {
    height: unit.x12
  },
  // The bell's slot, against the sidebar's bottom end corner (the root is its containing block).
  // Expanded it is the 36px box at the strip's end, centered in the strip under its 1px divider; the
  // rail moves it up by the strip's height plus the step, 12px in from the edge and 40px wide like the
  // nav items. The transform and the width ride the sidebar's own duration and easing.
  notifySlot: {
    position: 'absolute',
    bottom: `calc((${unit.x14} - 1px - ${unit.x9}) / 2)`,
    insetInlineEnd: unit.x4,
    width: unit.x9,
    height: unit.x9,
    transform: 'translateY(0)',
    transitionDuration: duration.slow,
    transitionProperty: {
      default: 'transform, width, inset-inline-end',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  notifySlotRail: {
    insetInlineEnd: unit.x3,
    width: unit.x10,
    transform: `translateY(calc(-1 * (${unit.x14} + ${unit.x3} - (${unit.x14} - 1px - ${unit.x9}) / 2)))`
  },
  notifyButton: {
    width: '100%',
    height: '100%'
  },
  // The bell is drawn at 20px; the rail's 16px is that scaled, so the size change animates too.
  notifyIcon: {
    transform: 'scale(1)',
    transitionDuration: duration.slow,
    transitionProperty: {
      default: 'transform',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard
  },
  notifyIconRail: {
    transform: 'scale(0.8)'
  },
  // With something unread the entry steps up from the idle gray to the full foreground; the dot on
  // the bell is the solid primary: the two together read as one state, the gray one as none.
  itemUnread: {
    color: colors.foregroundNeutral
  },
  // No gap: the label's own bottom padding is the step to the list, so it folds away with the row.
  group: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  groupLabel: {
    minHeight: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    paddingInline: unit.x3,
    paddingBlockEnd: unit.x2,
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity',
      [motion.reduce]: 'none'
    },
    transitionTimingFunction: easing.standard,
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
  itemCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded,
    fontWeight: fontWeight.medium
  },
  itemIdle: {
    color: colors.foregroundNeutralFaded
  },
  // The counterpart of the header strip: its divider edge to edge,
  // tall enough for a 48px row with 8px above and below.
  account: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: unit.x2,
    flexShrink: 0,
    height: unit.x14,
    minWidth: 0,
    // The avatar's center lines up with the nav icons' above it.
    paddingInline: unit.x4,
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colors.borderNeutralFaded
  }
})
