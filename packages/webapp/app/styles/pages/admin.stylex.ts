import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { container, unit, zIndex } from 'uilibs/styles/tokens.stylex'
import { breakpoints, layoutSize } from '#/styles/constants.stylex'

// The page's inset, shared by the page and the small-screen top bar so the bar's menu and bell
// glyphs line up with the content's edge. It sits closer to the sidebar than the customer pages'
// 3rem: beside a sidebar, a wide gutter reads as a gap.
const inset = layoutSize.adminInset

// The announcement strip's height beside the sidebar: its one-line message stays at the strip's
// `minHeight` there (`styles/element/announcement-bar.stylex.ts`), so the sticky settings aside starts
// below it. Below the compact breakpoint the message may wrap, but the aside is gone there.
const banner = unit.x10

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
  // The announcement strip stays in view: at the top beside the sidebar, under the sticky top bar
  // below the compact breakpoint.
  banner: {
    position: 'sticky',
    top: { default: 0, [breakpoints.compact]: unit.x14 },
    zIndex: zIndex.sticky
  },
  // Below the compact breakpoint the sidebar is not rendered and this bar stands in: the menu trigger, the
  // brand centered, and the notification trigger, in three equal-weight zones.
  topbar: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: unit.x2,
    position: 'sticky',
    top: 0,
    zIndex: zIndex.sticky,
    boxSizing: 'border-box',
    height: unit.x14,
    paddingInline: inset,
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
    padding: inset
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  subtitle: {
    margin: 0,
    color: colors.foregroundNeutralFaded
  },
  // The settings pages: a secondary aside beside the page. Below the compact breakpoint the aside
  // is gone and a select above the page stands in (`routes/admin/settings/-settings-nav.tsx`).
  settings: {
    display: 'flex',
    flexDirection: { default: 'row', [breakpoints.compact]: 'column' },
    alignItems: { default: 'flex-start', [breakpoints.compact]: 'stretch' }
  },
  // Like the sidebar: a column the height of the viewport below the pinned banner, with its own divider, items inset by
  // the same step as the sidebar's nav, and the first item level with the page title.
  // The groups stack with the sidebar's own step between them.
  settingsAside: {
    boxSizing: 'border-box',
    display: { default: 'flex', [breakpoints.compact]: 'none' },
    flexDirection: 'column',
    gap: unit.x5,
    flexShrink: 0,
    position: 'sticky',
    top: banner,
    width: container.xsmall,
    height: `calc(100dvh - ${banner})`,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    paddingBlockStart: inset,
    paddingBlockEnd: unit.x3,
    paddingInline: unit.x3,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.borderNeutralFaded
  },
  // A strip under the top bar, divided from the page like the bar itself.
  settingsPicker: {
    boxSizing: 'border-box',
    display: { default: 'none', [breakpoints.compact]: 'block' },
    paddingBlock: unit.x3,
    paddingInline: inset,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  // A readable measure for the forms that will fill the page, not the full width of a wide screen.
  settingsContent: {
    flex: 1,
    minWidth: 0,
    maxWidth: `calc(${container.xxlarge} * 2)`
  }
})
