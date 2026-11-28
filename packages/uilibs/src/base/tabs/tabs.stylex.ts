import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'
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
    // The indicator is placed against the list's padding box.
    position: 'relative',
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
  // The active mark: one element that slides to the selected tab (Base UI measures the tab into
  // `--active-tab-*`). `left` is physical on purpose: the offset is measured from the left edge in
  // both directions. Reduced motion moves it instantly.
  indicator: {
    boxSizing: 'border-box',
    pointerEvents: 'none',
    position: 'absolute',
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'left, width',
      '[data-orientation="vertical"]': 'top, height',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    transitionTimingFunction: easing.standard,
    zIndex: 0
  },
  // The pill list's active pill. Forced colors drop the fill: the pill keeps an edge instead.
  indicatorPill: {
    backgroundColor: colors.backgroundPage,
    borderColor: { default: 'transparent', '@media (forced-colors: active)': 'Highlight' },
    borderRadius: radius.small,
    borderStyle: 'solid',
    borderWidth: { default: 0, '@media (forced-colors: active)': stroke.ring1 },
    height: 'var(--active-tab-height)',
    left: 'var(--active-tab-left)',
    top: 'var(--active-tab-top)',
    width: 'var(--active-tab-width)'
  },
  indicatorRaised: {
    backgroundColor: colors.backgroundNeutral
  },
  // The underline list's bar: under the active tab, or on a vertical list's inline-start edge.
  indicatorUnderline: {
    backgroundColor: {
      default: colors.backgroundPrimary,
      '@media (forced-colors: active)': 'Highlight'
    },
    bottom: { default: 0, '[data-orientation="vertical"]': 'auto' },
    height: { default: stroke.ring2, '[data-orientation="vertical"]': 'var(--active-tab-height)' },
    insetInlineStart: { default: 'auto', '[data-orientation="vertical"]': 0 },
    left: { default: 'var(--active-tab-left)', '[data-orientation="vertical"]': 'auto' },
    top: { default: 'auto', '[data-orientation="vertical"]': 'var(--active-tab-top)' },
    width: { default: 'var(--active-tab-width)', '[data-orientation="vertical"]': stroke.ring2 }
  },
  // The bar sits over the rail's own line.
  indicatorBordered: {
    bottom: { default: `calc(-1 * ${stroke.ring1})`, '[data-orientation="vertical"]': 'auto' }
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
    // The active mark is the list's indicator, which slides under the label.
    backgroundColor: 'transparent',
    borderRadius: radius.small,
    borderStyle: 'none',
    borderWidth: 0,
    color: {
      default: colors.foregroundNeutralFaded,
      '[data-active]:not([data-disabled])': colors.foregroundNeutral,
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
    // Above the indicator.
    position: 'relative',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    zIndex: 1
  },
  // Underline style: the tab keeps the bar's room (its bottom edge) and the indicator draws over it.
  triggerUnderline: {
    borderBottomColor: 'transparent',
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring2,
    borderRadius: radius.none,
    marginBottom: `calc(-1 * ${stroke.ring1})`
  },
  // The `xsmall` pill is 20px tall, under the 24px target (WCAG 2.5.8): a hit area makes up the rest
  // inside the list's own padding, so it reaches neither the list's edge nor a neighbor.
  triggerHitArea: {
    '::after': {
      content: '""',
      insetBlock: `calc(-1 * ${unit.x0_5})`,
      insetInline: 0,
      position: 'absolute'
    }
  },
  // With no rail to overlap, the bar takes no negative margin.
  triggerBorderless: { marginBottom: 0 },
  // The new panel fades in and rises 4px from the side the tab came from (Base UI sets
  // `data-starting-style` on its first frame); reduced motion keeps the fade and drops the rise (the
  // media query sits inside each pose so it wins over the direction's attribute selector).
  content: {
    color: colors.foregroundNeutral,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    opacity: { default: 1, '[data-starting-style]': 0 },
    transform: {
      default: 'none',
      '[data-starting-style]': {
        '[data-activation-direction="none"]': {
          default: 'translateY(4px)',
          '@media (prefers-reduced-motion: reduce)': 'none'
        },
        '[data-activation-direction="left"]': {
          default: 'translateX(-4px)',
          '@media (prefers-reduced-motion: reduce)': 'none'
        },
        '[data-activation-direction="right"]': {
          default: 'translateX(4px)',
          '@media (prefers-reduced-motion: reduce)': 'none'
        },
        '[data-activation-direction="up"]': {
          default: 'translateY(-4px)',
          '@media (prefers-reduced-motion: reduce)': 'none'
        },
        '[data-activation-direction="down"]': {
          default: 'translateY(4px)',
          '@media (prefers-reduced-motion: reduce)': 'none'
        }
      }
    },
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.decelerate
  }
})

// The list is as tall as a control of its size (`xsmall` 28, `small` 32, `medium` 36, `large` 40). A
// pill list has 4px of padding around its tabs, so its tab is 8px shorter; an underline
// list (`bordered`, `borderless`) has none, so its tab is the full height.
export const tabsSizes = stylex.create({
  xsmall: { fontSize: fontSize.caption1, height: unit.x5 },
  small: { fontSize: fontSize.body2, height: unit.x6 },
  medium: { fontSize: fontSize.body2, height: unit.x7 },
  large: { fontSize: fontSize.body1, height: unit.x8 }
})

export const tabsUnderlineSizes = stylex.create({
  xsmall: { fontSize: fontSize.caption1, height: unit.x7 },
  small: { fontSize: fontSize.body2, height: unit.x8 },
  medium: { fontSize: fontSize.body2, height: unit.x9 },
  large: { fontSize: fontSize.body1, height: unit.x10 }
})
