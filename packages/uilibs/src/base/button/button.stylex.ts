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
    cursor: 'progress'
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

// A disabled button reads from the disabled tokens, never from `opacity` (which stacks). A loading
// button is also `data-disabled` (it blocks presses) but reads as busy, so it carries `data-loading`
// and is left out. Each fill names its own disabled values: a later style replaces a property
// wholesale, so a shared "disabled" recipe composed after the fill could not keep the fill's rest
// and hover values.
const off = (value: string) =>
  ({ ':disabled': value, '[data-disabled]:not([data-loading])': value }) as const

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
    backgroundColor: {
      default: colors.backgroundPrimary,
      [hover]: solidHover.primary,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.onBackgroundPrimary, ...off(colors.foregroundDisabled) }
  },
  neutral: {
    backgroundColor: {
      default: colors.foregroundNeutral,
      [hover]: solidHover.neutral,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.backgroundPage, ...off(colors.foregroundDisabled) }
  },
  critical: {
    backgroundColor: {
      default: colors.backgroundCritical,
      [hover]: solidHover.critical,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.onBackgroundCritical, ...off(colors.foregroundDisabled) }
  },
  positive: {
    backgroundColor: {
      default: colors.backgroundPositive,
      [hover]: solidHover.positive,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.onBackgroundPositive, ...off(colors.foregroundDisabled) }
  },
  warning: {
    backgroundColor: {
      default: colors.backgroundWarning,
      [hover]: solidHover.warning,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.onBackgroundWarning, ...off(colors.foregroundDisabled) }
  },
  media: {
    backgroundColor: { default: colors.white, [hover]: solidHover.media, ...off(white(10)) },
    color: { default: colors.black, ...off(white(40)) }
  },
  inherit: {
    backgroundColor: { default: current(16), [hover]: solidHover.inherit, ...off(current(8)) },
    color: { default: 'inherit', ...off(current(40)) }
  }
})

export const buttonFaded = stylex.create({
  primary: {
    backgroundColor: {
      default: colors.backgroundPrimaryFaded,
      [hover]: fadedHover.primary,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.foregroundPrimary, ...off(colors.foregroundDisabled) }
  },
  neutral: {
    backgroundColor: {
      default: colors.backgroundNeutral,
      [hover]: fadedHover.neutral,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.foregroundNeutral, ...off(colors.foregroundDisabled) }
  },
  critical: {
    backgroundColor: {
      default: colors.backgroundCriticalFaded,
      [hover]: fadedHover.critical,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.foregroundCritical, ...off(colors.foregroundDisabled) }
  },
  positive: {
    backgroundColor: {
      default: colors.backgroundPositiveFaded,
      [hover]: fadedHover.positive,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.foregroundPositive, ...off(colors.foregroundDisabled) }
  },
  warning: {
    backgroundColor: {
      default: colors.backgroundWarningFaded,
      [hover]: fadedHover.warning,
      ...off(colors.backgroundNeutral)
    },
    color: { default: colors.foregroundWarning, ...off(colors.foregroundDisabled) }
  },
  media: {
    backgroundColor: { default: white(20), [hover]: fadedHover.media, ...off(white(10)) },
    color: { default: colors.white, ...off(white(40)) }
  },
  inherit: {
    backgroundColor: { default: current(10), [hover]: fadedHover.inherit, ...off(current(8)) },
    color: { default: 'inherit', ...off(current(40)) }
  }
})

export const buttonOutline = stylex.create({
  primary: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.primary },
    borderColor: { default: colors.borderPrimary, ...off(colors.borderDisabled) },
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: { default: colors.foregroundPrimary, ...off(colors.foregroundDisabled) }
  },
  neutral: {
    backgroundColor: { default: colors.backgroundPage, [hover]: tintHover.neutral },
    borderColor: { default: colors.borderNeutralFaded, ...off(colors.borderDisabled) },
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: { default: colors.foregroundNeutral, ...off(colors.foregroundDisabled) }
  },
  critical: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.critical },
    borderColor: { default: colors.borderCritical, ...off(colors.borderDisabled) },
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: { default: colors.foregroundCritical, ...off(colors.foregroundDisabled) }
  },
  positive: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.positive },
    borderColor: { default: colors.borderPositive, ...off(colors.borderDisabled) },
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: { default: colors.foregroundPositive, ...off(colors.foregroundDisabled) }
  },
  warning: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.warning },
    borderColor: { default: colors.borderWarning, ...off(colors.borderDisabled) },
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: { default: colors.foregroundWarning, ...off(colors.foregroundDisabled) }
  },
  media: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.media },
    borderColor: { default: colors.white, ...off(white(20)) },
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: { default: colors.white, ...off(white(40)) }
  },
  inherit: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.inherit },
    borderColor: { default: 'currentColor', ...off(current(20)) },
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: { default: 'inherit', ...off(current(40)) }
  }
})

export const buttonGhost = stylex.create({
  primary: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.primary },
    color: { default: colors.foregroundPrimary, ...off(colors.foregroundDisabled) }
  },
  neutral: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.neutral },
    color: { default: colors.foregroundNeutral, ...off(colors.foregroundDisabled) }
  },
  critical: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.critical },
    color: { default: colors.foregroundCritical, ...off(colors.foregroundDisabled) }
  },
  positive: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.positive },
    color: { default: colors.foregroundPositive, ...off(colors.foregroundDisabled) }
  },
  warning: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.warning },
    color: { default: colors.foregroundWarning, ...off(colors.foregroundDisabled) }
  },
  media: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.media },
    color: { default: colors.white, ...off(white(40)) }
  },
  inherit: {
    backgroundColor: { default: 'transparent', [hover]: tintHover.inherit },
    color: { default: 'inherit', ...off(current(40)) }
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
  lg: { paddingInline: unit.x6 }
})

// The square of an icon-only button: as wide as its size is tall (`xs` 28, `sm` 32, `md` 36, `lg` 40).
// Composed after `buttonSizes`, which has the height.
export const buttonSquare = stylex.create({
  xs: { paddingInline: 0, width: unit.x7 },
  sm: { paddingInline: 0, width: unit.x8 },
  md: { paddingInline: 0, width: unit.x9 },
  lg: { paddingInline: 0, width: unit.x10 }
})
