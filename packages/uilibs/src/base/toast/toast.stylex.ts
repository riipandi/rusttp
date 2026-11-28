import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from '../../styles/colors.stylex'
import { stroke, container } from '../../styles/tokens.stylex'
import { unit, radius, zIndex } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

export const toastStyles = stylex.create({
  // A zero-height box on the chosen edge; `toastPositions` sets the corner.
  viewport: {
    position: 'fixed',
    width: container.medium,
    zIndex: zIndex.toast
  },
  root: {
    // Behind toasts peek out above the frontmost one, shrunk slightly; swipe
    // movement rides along via the Base UI-provided CSS variables.
    '--toast-gap': unit.x2,
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundElevationOverlay,
    // The accent is `toastColors`; a neutral toast has the quiet edge.
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    boxShadow: shadow.overlay,
    boxSizing: 'border-box',
    color: colors.foregroundNeutral,
    display: 'flex',
    fontFamily: fontFamily.body,
    // Behind-card content fades in when the stack expands (read by .content).
    '--toast-content-visible': { default: null, '[data-expanded]': '1' },
    // All toasts share the frontmost height while collapsed so the stack
    // reads as one card with edges peeking out.
    height: {
      default: 'var(--toast-frontmost-height)',
      '[data-expanded]': 'var(--toast-height)'
    },
    // [data-limited]: over the provider's limit — kept mounted, hidden by us.
    opacity: {
      default: 1,
      '[data-limited]': 0,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    overflow: 'hidden',
    padding: unit.x4,
    position: 'absolute',
    right: 0,
    transitionDuration: { default: duration.slow, '[data-swiping]': '0s' },
    transitionProperty: {
      default: 'transform, opacity, height',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.decelerate,
    width: '100%',
    zIndex: `calc(${zIndex.toast} - var(--toast-index))`
  },
  // The stack grows away from the edge a toast is anchored to: bottom toasts pile up, top toasts
  // pile down, and each enters from and leaves toward its own edge. Later conditions win at equal
  // specificity: the closed pose overrides the expanded/collapsed stack pose while entering or leaving.
  rootBottom: {
    bottom: 0,
    transform: {
      default: `translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(var(--toast-swipe-movement-y, 0px) + min(var(--toast-index), 10) * -1 * var(--toast-gap))) scale(calc(max(0.8, 1 - var(--toast-index) * 0.05)))`,
      '[data-expanded]': `translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(var(--toast-swipe-movement-y, 0px) - var(--toast-offset-y) - var(--toast-index) * var(--toast-gap)))`,
      '[data-starting-style]': `translateY(calc(100% + ${unit.x4}))`,
      '[data-ending-style]': `translateY(calc(100% + ${unit.x4}))`
    },
    transformOrigin: 'center bottom'
  },
  rootTop: {
    top: 0,
    transform: {
      default: `translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(var(--toast-swipe-movement-y, 0px) + min(var(--toast-index), 10) * var(--toast-gap))) scale(calc(max(0.8, 1 - var(--toast-index) * 0.05)))`,
      '[data-expanded]': `translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(var(--toast-swipe-movement-y, 0px) + var(--toast-offset-y) + var(--toast-index) * var(--toast-gap)))`,
      '[data-starting-style]': `translateY(calc(-100% - ${unit.x4}))`,
      '[data-ending-style]': `translateY(calc(-100% - ${unit.x4}))`
    },
    transformOrigin: 'center top'
  },
  content: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'space-between',
    // Behind toasts hide their content so the collapsed stack shows only the
    // frontmost card's text; expanding reveals every card (custom property set
    // by rootExpanded).
    opacity: `var(--toast-content-visible, calc(max(0, 1 - var(--toast-index))))`,
    transitionDuration: duration.fast,
    transitionProperty: 'opacity',
    width: '100%'
  },
  // The status glyph: one title line tall, so the mark centres on the title's first line.
  glyph: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    height: fontLineHeight.body2,
    justifyContent: 'center'
  },
  text: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: unit.x1
  },
  title: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.semibold,
    lineHeight: fontLineHeight.body2,
    margin: 0
  },
  action: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutralFaded
    },
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.small,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundNeutral,
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    height: unit.x6,
    justifyContent: 'center',
    paddingInline: unit.x2
  },
  // Smaller than the shared `CloseButton`, which supplies the look.
  close: {
    height: unit.x6,
    width: unit.x6
  }
})

// Physical sides on purpose: a toast keeps the screen side it is given in both directions.
export const toastPositions = stylex.create({
  'top-left': { left: unit.x4, top: unit.x4 },
  'top-center': { insetInline: 0, marginInline: 'auto', top: unit.x4 },
  'top-right': { right: unit.x4, top: unit.x4 },
  'bottom-left': { bottom: unit.x4, left: unit.x4 },
  'bottom-center': { bottom: unit.x4, insetInline: 0, marginInline: 'auto' },
  'bottom-right': { bottom: unit.x4, right: unit.x4 }
})

// A status shows in four quiet places: the edge, a faded tint of the surface, and the color of the
// title and the glyph (which take the toast's `color`). The description and the buttons keep their
// neutral text so it holds its contrast on the tint.
export const toastColors = stylex.create({
  neutral: {},
  primary: {
    backgroundColor: colors.backgroundPrimaryFaded,
    borderColor: colors.borderPrimary,
    color: colors.foregroundPrimary
  },
  positive: {
    backgroundColor: colors.backgroundPositiveFaded,
    borderColor: colors.borderPositive,
    color: colors.foregroundPositive
  },
  warning: {
    backgroundColor: colors.backgroundWarningFaded,
    borderColor: colors.borderWarning,
    color: colors.foregroundWarning
  },
  critical: {
    backgroundColor: colors.backgroundCriticalFaded,
    borderColor: colors.borderCritical,
    color: colors.foregroundCritical
  }
})
