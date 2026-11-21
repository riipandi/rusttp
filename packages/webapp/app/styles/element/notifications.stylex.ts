import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { container, fontSize, fontWeight, radius, unit } from 'uilibs/styles/tokens.stylex'

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
    width: `min(${container.large}, calc(100vw - ${unit.x4}))`,
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
    gap: unit.x1,
    maxHeight: 'min(26rem, 60dvh)',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    padding: unit.x2
  },
  row: {
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    borderRadius: radius.medium
  },
  rowUnread: {
    backgroundColor: colors.backgroundNeutralFaded
  },
  media: {
    // The icon sits on the first line of the title.
    paddingBlockStart: unit.x0_5
  },
  title: {
    fontWeight: fontWeight.medium
  },
  titleRead: {
    color: colors.foregroundNeutralFaded,
    fontWeight: fontWeight.regular
  },
  body: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden'
  },
  time: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1
  },
  actions: {
    flexShrink: 0,
    gap: 0,
    // The buttons' own 32px boxes sit flush with the row's padding.
    marginBlockStart: `calc(-1 * ${unit.x1})`,
    marginInlineEnd: `calc(-1 * ${unit.x1})`
  },
  action: {
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral,
      ':focus-visible': colors.foregroundNeutral
    }
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
