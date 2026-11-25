import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const tabsStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x2
  },
  rootVertical: {
    flexDirection: 'row'
  },
  list: {
    alignItems: { default: 'center', '[data-orientation="vertical"]': 'stretch' },
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.medium,
    display: 'inline-flex',
    flexDirection: { default: 'row', '[data-orientation="vertical"]': 'column' },
    gap: unit.x1,
    height: { default: null, '[data-orientation="vertical"]': 'fit-content' },
    padding: unit.x1,
    width: 'fit-content'
  },
  // `bordered`: the underline list sits on a border rail.
  listBordered: {
    backgroundColor: 'transparent',
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1,
    borderRadius: radius.none,
    gap: 0,
    padding: 0
  },
  // `borderless`: the same list with no rail, for a parent that draws its own border.
  listBorderless: {
    backgroundColor: 'transparent',
    borderRadius: radius.none,
    gap: 0,
    padding: 0
  },
  // `pills-raised`: the pill list lifts off the page on the raised surface; the active pill takes
  // the neutral tint, since the list is no longer tinted.
  listRaised: {
    backgroundColor: colors.backgroundElevationBase,
    boxShadow: shadow.raised
  },
  triggerRaised: {
    backgroundColor: {
      default: 'transparent',
      '[data-active]': colors.backgroundNeutral
    }
  },
  // `itemWidth='equal'`: the list spans its parent and every trigger takes an equal share of it. A
  // vertical list stays as wide as its widest trigger, so the shares there are the triggers' own.
  listEqual: {
    width: { default: '100%', '[data-orientation="vertical"]': 'fit-content' }
  },
  triggerEqual: {
    flexBasis: { default: 0, '[data-orientation="vertical"]': 'auto' },
    flexGrow: { default: 1, '[data-orientation="vertical"]': 0 },
    minWidth: 0
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      '[data-active]': colors.backgroundPage
    },
    borderColor: { default: 'transparent', '@media (forced-colors: active)': 'Highlight' },
    borderRadius: radius.small,
    borderStyle: { default: 'none', '@media (forced-colors: active)': 'solid' },
    // Forced colors drop the active pill's background: the active tab gets an edge instead.
    borderWidth: {
      default: 0,
      '@media (forced-colors: active)': { default: 0, '[data-active]': stroke.ring1 }
    },
    color: {
      default: colors.foregroundNeutralFaded,
      '[data-active]:not([data-disabled])': colors.foregroundNeutral,
      ':disabled': colors.foregroundDisabled,
      '[data-disabled]': colors.foregroundDisabled
    },
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    justifyContent: 'center',
    lineHeight: fontLineHeight.body2,
    // A tab's ring sits inside its pill, which would clip an outside ring.
    outlineOffset: `calc(-1 * ${stroke.ring2})`,
    paddingInline: unit.x3,
    userSelect: 'none',
    whiteSpace: 'nowrap'
  },
  // Underline style: the active tab draws a bar over the list's bottom border.
  triggerUnderline: {
    backgroundColor: 'transparent',
    borderBottomColor: {
      default: 'transparent',
      '[data-active]': colors.backgroundPrimary,
      '@media (forced-colors: active)': { default: 'Canvas', '[data-active]': 'Highlight' }
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring2,
    borderRadius: radius.none,
    marginBottom: `calc(-1 * ${stroke.ring1})`
  },
  // With no rail to overlap, the bar takes no negative margin.
  triggerBorderless: { marginBottom: 0 },
  content: {
    color: colors.foregroundNeutral,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2
  }
})

// The list is as tall as a control of its size (`xs` 28, `sm` 32, `md` 36, `lg` 40). A
// pill list has 4px of padding around its tabs, so its tab is 8px shorter; an underline
// list (`bordered`, `borderless`) has none, so its tab is the full height.
export const tabsSizes = stylex.create({
  xs: { fontSize: fontSize.caption1, height: unit.x5 },
  sm: { fontSize: fontSize.body2, height: unit.x6 },
  md: { fontSize: fontSize.body2, height: unit.x7 },
  lg: { fontSize: fontSize.body1, height: unit.x8 }
})

export const tabsUnderlineSizes = stylex.create({
  xs: { fontSize: fontSize.caption1, height: unit.x7 },
  sm: { fontSize: fontSize.body2, height: unit.x8 },
  md: { fontSize: fontSize.body2, height: unit.x9 },
  lg: { fontSize: fontSize.body1, height: unit.x10 }
})
