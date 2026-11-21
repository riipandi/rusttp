import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { container, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '#/styles/constants.stylex'

// The page's inset, shared by the page and the small-screen top bar so the bar's menu and bell
// glyphs line up with the content's edge. It sits closer to the sidebar than the customer pages'
// 3rem: beside a sidebar, a wide gutter reads as a gap.
const inset = 'clamp(1.5rem, 3vw, 2rem)'

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
  // Below the compact breakpoint the sidebar is gone and this bar stands in: the menu trigger, the
  // brand centered, and the notification trigger, in three equal-weight zones.
  topbar: {
    display: { default: 'none', [breakpoints.compact]: 'grid' },
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: unit.x2,
    position: 'sticky',
    top: 0,
    zIndex: 10,
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
  title: {
    margin: 0,
    fontSize: fontSize.featured2,
    fontWeight: fontWeight.bold,
    lineHeight: 1.15,
    letterSpacing: '-0.02em'
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
  // Like the sidebar: a column the full height of the viewport with its own divider, items inset by
  // the same step as the sidebar's nav, and the first item level with the page title.
  // The groups stack with the sidebar's own step between them.
  settingsAside: {
    boxSizing: 'border-box',
    display: { default: 'flex', [breakpoints.compact]: 'none' },
    flexDirection: 'column',
    gap: unit.x5,
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    width: container.xsmall,
    height: '100dvh',
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
