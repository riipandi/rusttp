import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { container, fontLineHeight, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

// The notifications popover: a header, a scrolling list of rows, and a footer link, edge to edge in
// the popup (`components/notifications.tsx`, opened from each layout's bell).
export const styles = stylex.create({
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
  // Replaces the popover's own padding and width: on a phone it keeps 8px from each screen edge.
  panel: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    width: `min(${container.medium}, calc(100vw - ${unit.x4}))`,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: unit.x2,
    flexShrink: 0,
    paddingBlock: unit.x2,
    paddingInlineStart: unit.x4,
    paddingInlineEnd: unit.x2,
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colors.borderNeutralFaded
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: unit.x2,
    minWidth: 0
  },
  // Only this part scrolls, so the header and the footer stay in view.
  list: {
    boxSizing: 'border-box',
    gap: 0,
    maxHeight: 'min(24rem, 60dvh)',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    paddingBlock: unit.x1,
    paddingInline: 0
  },
  // Edge to edge, with no fill or edge of its own: the text starts where the header's title does
  // (16px) and the menu trigger ends where the header's does (8px from the edge), so both line up.
  row: {
    position: 'relative',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    borderWidth: 0,
    borderRadius: 0,
    paddingBlock: unit.x1_5,
    paddingInlineStart: unit.x4,
    paddingInlineEnd: unit.x2
  },
  // Unread is a dot hanging in the left gutter, centred on the title's first line, and a title at
  // full strength; a read row has neither, so it recedes without a fill to add noise to the list.
  unreadDot: {
    position: 'absolute',
    top: `calc(${unit.x1_5} + ${fontLineHeight.body2} / 2 - ${unit.x1_5} / 2)`,
    insetInlineStart: unit.x1,
    width: unit.x1_5,
    height: unit.x1_5,
    borderRadius: '50%',
    backgroundColor: colors.backgroundPrimary
  },
  title: {
    color: colors.foregroundNeutral,
    fontWeight: fontWeight.medium
  },
  titleRead: {
    color: colors.foregroundNeutralFaded,
    fontWeight: fontWeight.regular
  },
  // The preview and the time are caption-sized: the title carries the row, the rest is detail.
  body: {
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden'
  },
  time: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1
  },
  content: {
    minWidth: 0
  },
  // The menu trigger at the row's top-right, its 32px box centred on the title's first line.
  actions: {
    flexShrink: 0,
    marginBlock: `calc(-1 * ${unit.x1_5})`
  },
  action: {
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral,
      ':focus-visible': colors.foregroundNeutral
    }
  },
  // The menus' items are caption-sized, to sit with the rows they act on.
  menuItem: {
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1
  },
  empty: {
    borderWidth: 0,
    paddingBlock: unit.x8
  },
  footer: {
    flexShrink: 0,
    padding: unit.x2,
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colors.borderNeutralFaded
  },
  footerLink: {
    width: '100%'
  }
})
