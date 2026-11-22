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
// (`primary`, `neutral`, `critical`); every fill has every color, so `buttonFills[fill][color]` is
// one style. Reshaped names the same two axes `variant` and `color`.
const hover = ':hover:not(:disabled)'

export const buttonSolid = stylex.create({
  primary: {
    backgroundColor: {
      default: colors.backgroundPrimary,
      [hover]: colors.backgroundPrimaryHighlighted
    },
    color: colors.onBrand
  },
  neutral: {
    backgroundColor: {
      default: colors.foregroundNeutral,
      [hover]: `color-mix(in srgb, ${colors.foregroundNeutral} 85%, ${colors.backgroundPage})`
    },
    color: colors.backgroundPage
  },
  critical: {
    backgroundColor: {
      default: colors.backgroundCritical,
      [hover]: colors.backgroundCriticalHighlighted
    },
    color: colors.onBackgroundCritical
  },
  positive: {
    backgroundColor: {
      default: colors.backgroundPositive,
      [hover]: colors.backgroundPositiveHighlighted
    },
    color: colors.onBackgroundPositive
  },
  warning: {
    backgroundColor: {
      default: colors.backgroundWarning,
      [hover]: colors.backgroundWarningHighlighted
    },
    color: colors.onBackgroundWarning
  }
})

export const buttonFaded = stylex.create({
  primary: {
    backgroundColor: {
      default: colors.backgroundPrimaryFaded,
      [hover]: colors.backgroundPrimaryHighlightedFaded
    },
    color: colors.foregroundPrimary
  },
  neutral: {
    backgroundColor: {
      default: colors.backgroundNeutral,
      [hover]: colors.backgroundNeutralHighlighted
    },
    color: colors.foregroundNeutral
  },
  critical: {
    backgroundColor: {
      default: colors.backgroundCriticalFaded,
      [hover]: colors.backgroundCriticalHighlightedFaded
    },
    color: colors.foregroundCritical
  },
  positive: {
    backgroundColor: {
      default: colors.backgroundPositiveFaded,
      [hover]: colors.backgroundPositiveHighlightedFaded
    },
    color: colors.foregroundPositive
  },
  warning: {
    backgroundColor: {
      default: colors.backgroundWarningFaded,
      [hover]: colors.backgroundWarningHighlightedFaded
    },
    color: colors.foregroundWarning
  }
})

export const buttonOutline = stylex.create({
  primary: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundPrimaryFaded },
    borderColor: colors.borderPrimary,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundPrimary
  },
  neutral: {
    backgroundColor: {
      default: colors.backgroundPage,
      [hover]: colors.backgroundNeutralFaded
    },
    borderColor: colors.borderNeutralFaded,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundNeutral
  },
  critical: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundCriticalFaded },
    borderColor: colors.borderCritical,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundCritical
  },
  positive: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundPositiveFaded },
    borderColor: colors.borderPositive,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundPositive
  },
  warning: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundWarningFaded },
    borderColor: colors.borderWarning,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundWarning
  }
})

export const buttonGhost = stylex.create({
  primary: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundPrimaryFaded },
    color: colors.foregroundPrimary
  },
  neutral: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundNeutralFaded },
    color: colors.foregroundNeutral
  },
  critical: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundCriticalFaded },
    color: colors.foregroundCritical
  },
  positive: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundPositiveFaded },
    color: colors.foregroundPositive
  },
  warning: {
    backgroundColor: { default: 'transparent', [hover]: colors.backgroundWarningFaded },
    color: colors.foregroundWarning
  }
})

export const buttonFills = {
  solid: buttonSolid,
  faded: buttonFaded,
  outline: buttonOutline,
  ghost: buttonGhost
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
