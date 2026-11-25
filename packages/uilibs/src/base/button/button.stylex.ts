import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const buttonStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.medium,
    borderStyle: 'none',
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x2,
    justifyContent: 'center',
    lineHeight: fontLineHeight.body2,
    position: 'relative',
    textDecoration: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  },
  // Loading: the label stays (it names the button and holds the width) but is
  // hidden under a centered spinner, and the button reads as busy, not disabled.
  loading: {
    cursor: 'progress',
    opacity: 1
  },
  content: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: 'inherit',
    justifyContent: 'center'
  },
  contentHidden: {
    opacity: 0
  },
  spinner: {
    alignItems: 'center',
    display: 'flex',
    insetBlock: 0,
    insetInline: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute'
  }
})

// A fill is the shape of a button (`solid`, `faded`, `outline`, `ghost`) and a color is its role
// (`primary`, `neutral`, `critical`, `positive`, `warning`, plus `media` and `inherit`); every fill
// has every color, so `buttonFills[fill][color]` is one style. Reshaped names the same two axes
// `variant` and `color`.
const hover = ':hover:not(:disabled)'

// `media` is for a photo or a dark surface, so it reads the constant white and black rather than a
// themed color: it looks the same in both themes. `inherit` takes whatever text color the parent
// sets and mixes it into the fill and the edge, so it works on any surface. It has no cut-out
// `solid` (`currentColor` is the button's own color, so a label cannot be cut out of its parent's):
// `solid` is a stronger tint instead. The tints stay light so the parent's own text color keeps
// its contrast on them.
const white = (percent: number) => `color-mix(in srgb, ${colors.white} ${percent}%, transparent)`
const current = (percent: number) => `color-mix(in srgb, currentColor ${percent}%, transparent)`

// The fill each color moves to on hover. `buttonHighlighted` repeats it as a rest state, so a
// button can be shown pressed-in-waiting without the pointer.
const solidHover = {
  primary: colors.backgroundPrimaryHighlighted,
  neutral: `color-mix(in srgb, ${colors.foregroundNeutral} 85%, ${colors.backgroundPage})`,
  critical: colors.backgroundCriticalHighlighted,
  positive: colors.backgroundPositiveHighlighted,
  warning: colors.backgroundWarningHighlighted,
  media: white(88),
  inherit: current(20)
}

const fadedHover = {
  primary: colors.backgroundPrimaryHighlightedFaded,
  neutral: colors.backgroundNeutralHighlighted,
  critical: colors.backgroundCriticalHighlightedFaded,
  positive: colors.backgroundPositiveHighlightedFaded,
  warning: colors.backgroundWarningHighlightedFaded,
  media: white(30),
  inherit: current(14)
}

const tintHover = {
  primary: colors.backgroundPrimaryFaded,
  neutral: colors.backgroundNeutralFaded,
  critical: colors.backgroundCriticalFaded,
  positive: colors.backgroundPositiveFaded,
  warning: colors.backgroundWarningFaded,
  media: white(20),
  inherit: current(12)
}

export const buttonSolid = stylex.create({
  primary: {
    backgroundColor: { default: colors.backgroundPrimary, [hover]: solidHover.primary },
    color: colors.onBackgroundPrimary
  },
  neutral: {
    backgroundColor: { default: colors.foregroundNeutral, [hover]: solidHover.neutral },
    color: colors.backgroundPage
  },
  critical: {
    backgroundColor: { default: colors.backgroundCritical, [hover]: solidHover.critical },
    color: colors.onBackgroundCritical
  },
  positive: {
    backgroundColor: { default: colors.backgroundPositive, [hover]: solidHover.positive },
    color: colors.onBackgroundPositive
  },
  warning: {
    backgroundColor: { default: colors.backgroundWarning, [hover]: solidHover.warning },
    color: colors.onBackgroundWarning
  },
  media: {
    backgroundColor: { default: colors.white, [hover]: solidHover.media },
    color: colors.black
  },
  inherit: {
    backgroundColor: { default: current(16), [hover]: solidHover.inherit },
    color: 'inherit'
  }
})

export const buttonFaded = stylex.create({
  primary: {
    backgroundColor: { default: colors.backgroundPrimaryFaded, [hover]: fadedHover.primary },
    color: colors.foregroundPrimary
  },
  neutral: {
    backgroundColor: { default: colors.backgroundNeutral, [hover]: fadedHover.neutral },
    color: colors.foregroundNeutral
  },
  critical: {
    backgroundColor: { default: colors.backgroundCriticalFaded, [hover]: fadedHover.critical },
    color: colors.foregroundCritical
  },
  positive: {
    backgroundColor: { default: colors.backgroundPositiveFaded, [hover]: fadedHover.positive },
    color: colors.foregroundPositive
  },
  warning: {
    backgroundColor: { default: colors.backgroundWarningFaded, [hover]: fadedHover.warning },
    color: colors.foregroundWarning
  },
  media: {
    backgroundColor: { default: white(20), [hover]: fadedHover.media },
    color: colors.white
  },
  inherit: {
    backgroundColor: { default: current(10), [hover]: fadedHover.inherit },
    color: 'inherit'
  }
})

export const buttonOutline = stylex.create({
  primary: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.primary },
    borderColor: colors.borderPrimary,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundPrimary
  },
  neutral: {
    backgroundColor: { default: colors.backgroundPage, [hover]: tintHover.neutral },
    borderColor: colors.borderNeutralFaded,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundNeutral
  },
  critical: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.critical },
    borderColor: colors.borderCritical,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundCritical
  },
  positive: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.positive },
    borderColor: colors.borderPositive,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundPositive
  },
  warning: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.warning },
    borderColor: colors.borderWarning,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundWarning
  },
  media: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.media },
    borderColor: colors.white,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.white
  },
  inherit: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.inherit },
    borderColor: 'currentColor',
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: 'inherit'
  }
})

export const buttonGhost = stylex.create({
  primary: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.primary },
    color: colors.foregroundPrimary
  },
  neutral: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.neutral },
    color: colors.foregroundNeutral
  },
  critical: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.critical },
    color: colors.foregroundCritical
  },
  positive: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.positive },
    color: colors.foregroundPositive
  },
  warning: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.warning },
    color: colors.foregroundWarning
  },
  media: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.media },
    color: colors.white
  },
  inherit: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.inherit },
    color: 'inherit'
  }
})

export const buttonFills = {
  solid: buttonSolid,
  faded: buttonFaded,
  outline: buttonOutline,
  ghost: buttonGhost
}

// `highlighted`: the hover fill held at rest. Composed after the fill, so it replaces the fill's
// `backgroundColor` (and its hover branch) outright.
// Outline and ghost hold the same tint.
const tintHighlighted = stylex.create({
  primary: { backgroundColor: tintHover.primary },
  neutral: { backgroundColor: tintHover.neutral },
  critical: { backgroundColor: tintHover.critical },
  positive: { backgroundColor: tintHover.positive },
  warning: { backgroundColor: tintHover.warning },
  media: { backgroundColor: tintHover.media },
  inherit: { backgroundColor: tintHover.inherit }
})

export const buttonHighlighted = {
  solid: stylex.create({
    primary: { backgroundColor: solidHover.primary },
    neutral: { backgroundColor: solidHover.neutral },
    critical: { backgroundColor: solidHover.critical },
    positive: { backgroundColor: solidHover.positive },
    warning: { backgroundColor: solidHover.warning },
    media: { backgroundColor: solidHover.media },
    inherit: { backgroundColor: solidHover.inherit }
  }),
  faded: stylex.create({
    primary: { backgroundColor: fadedHover.primary },
    neutral: { backgroundColor: fadedHover.neutral },
    critical: { backgroundColor: fadedHover.critical },
    positive: { backgroundColor: fadedHover.positive },
    warning: { backgroundColor: fadedHover.warning },
    media: { backgroundColor: fadedHover.media },
    inherit: { backgroundColor: fadedHover.inherit }
  }),
  outline: tintHighlighted,
  ghost: tintHighlighted
}

// Boolean props that change the box, composed after the fill and the size.
export const buttonModifiers = stylex.create({
  rounded: { borderRadius: radius.full },
  fullWidth: { width: '100%' },
  raised: { boxShadow: shadow.raised }
})

export const buttonSizes = stylex.create({
  xs: { fontSize: fontSize.caption1, gap: unit.x1, height: unit.x7, paddingInline: unit.x2 },
  // sm, md, and lg take height and type from `controlSizes`; only the padding is a button's own.
  sm: { paddingInline: unit.x3 },
  md: { paddingInline: unit.x4 },
  lg: { paddingInline: unit.x6 },
  'icon-xs': { height: unit.x7, paddingInline: 0, width: unit.x7 },
  'icon-sm': { height: unit.x8, paddingInline: 0, width: unit.x8 },
  'icon-md': { height: unit.x9, paddingInline: 0, width: unit.x9 },
  'icon-lg': { height: unit.x10, paddingInline: 0, width: unit.x10 }
})
