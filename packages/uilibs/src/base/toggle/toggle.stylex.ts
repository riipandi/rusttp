import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

const hover = ':hover:not(:disabled)'

export const toggleStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.large,
    borderStyle: 'none',
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x1,
    justifyContent: 'center',
    lineHeight: fontLineHeight.body2,
    userSelect: 'none',
    whiteSpace: 'nowrap'
  }
})

// The pressed look is chosen by two props: `selectedVariant` (its fill) and `selectedColor` (its
// role). The rest look is chosen by `variant`. They are set apart so the combinations stay 3 + 15
// styles, not 45: a pressed style only sets these variables, and the rest style reads them under
// `[data-pressed]`.
export const togglePressed = stylex.defineVars({
  background: 'transparent',
  color: 'inherit',
  // The border color of an `outline` toggle while pressed.
  edge: 'transparent',
  // An inset edge for a pressed toggle that has no border at rest.
  ring: 'none'
})

// `ghost` and `outline` rest transparent and tint on hover; `solid` rests on a neutral fill.
export const toggleRest = stylex.create({
  quiet: {
    backgroundColor: {
      default: 'transparent',
      [hover]: colors.backgroundNeutral,
      '[data-pressed]': togglePressed.background
    },
    boxShadow: { default: 'none', '[data-pressed]': togglePressed.ring },
    color: {
      default: colors.foregroundNeutral,
      '[data-pressed]:not([data-disabled])': togglePressed.color,
      ':disabled': colors.foregroundDisabled,
      '[data-disabled]': colors.foregroundDisabled
    }
  },
  solid: {
    backgroundColor: {
      default: colors.backgroundNeutral,
      [hover]: colors.backgroundNeutralHighlighted,
      '[data-pressed]': togglePressed.background
    },
    boxShadow: { default: 'none', '[data-pressed]': togglePressed.ring },
    color: {
      default: colors.foregroundNeutral,
      '[data-pressed]:not([data-disabled])': togglePressed.color,
      ':disabled': colors.foregroundDisabled,
      '[data-disabled]': colors.foregroundDisabled
    }
  }
})

const roles = {
  neutral: {
    tint: colors.backgroundNeutral,
    text: colors.foregroundNeutral,
    edge: colors.borderNeutral,
    fill: colors.foregroundNeutral,
    onFill: colors.backgroundPage
  },
  primary: {
    tint: colors.backgroundPrimaryFaded,
    text: colors.foregroundPrimary,
    edge: colors.borderPrimary,
    fill: colors.backgroundPrimary,
    onFill: colors.onBackgroundPrimary
  },
  critical: {
    tint: colors.backgroundCriticalFaded,
    text: colors.foregroundCritical,
    edge: colors.borderCritical,
    fill: colors.backgroundCritical,
    onFill: colors.onBackgroundCritical
  },
  positive: {
    tint: colors.backgroundPositiveFaded,
    text: colors.foregroundPositive,
    edge: colors.borderPositive,
    fill: colors.backgroundPositive,
    onFill: colors.onBackgroundPositive
  },
  warning: {
    tint: colors.backgroundWarningFaded,
    text: colors.foregroundWarning,
    edge: colors.borderWarning,
    fill: colors.backgroundWarning,
    onFill: colors.onBackgroundWarning
  }
}

// `ghost`: a tint of the role. `outline`: an edge in the role, drawn inside the box so the toggle
// does not grow. `solid`: the role's fill.
export const toggleSelected = {
  ghost: stylex.create({
    neutral: {
      [togglePressed.background]: roles.neutral.tint,
      [togglePressed.color]: roles.neutral.text,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    primary: {
      [togglePressed.background]: roles.primary.tint,
      [togglePressed.color]: roles.primary.text,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    critical: {
      [togglePressed.background]: roles.critical.tint,
      [togglePressed.color]: roles.critical.text,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    positive: {
      [togglePressed.background]: roles.positive.tint,
      [togglePressed.color]: roles.positive.text,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    warning: {
      [togglePressed.background]: roles.warning.tint,
      [togglePressed.color]: roles.warning.text,
      [togglePressed.edge]: colors.borderNeutralFaded
    }
  }),
  outline: stylex.create({
    neutral: {
      [togglePressed.background]: 'transparent',
      [togglePressed.color]: roles.neutral.text,
      [togglePressed.edge]: roles.neutral.edge,
      [togglePressed.ring]: `inset 0 0 0 ${stroke.ring1} ${roles.neutral.edge}`
    },
    primary: {
      [togglePressed.background]: 'transparent',
      [togglePressed.color]: roles.primary.text,
      [togglePressed.edge]: roles.primary.edge,
      [togglePressed.ring]: `inset 0 0 0 ${stroke.ring1} ${roles.primary.edge}`
    },
    critical: {
      [togglePressed.background]: 'transparent',
      [togglePressed.color]: roles.critical.text,
      [togglePressed.edge]: roles.critical.edge,
      [togglePressed.ring]: `inset 0 0 0 ${stroke.ring1} ${roles.critical.edge}`
    },
    positive: {
      [togglePressed.background]: 'transparent',
      [togglePressed.color]: roles.positive.text,
      [togglePressed.edge]: roles.positive.edge,
      [togglePressed.ring]: `inset 0 0 0 ${stroke.ring1} ${roles.positive.edge}`
    },
    warning: {
      [togglePressed.background]: 'transparent',
      [togglePressed.color]: roles.warning.text,
      [togglePressed.edge]: roles.warning.edge,
      [togglePressed.ring]: `inset 0 0 0 ${stroke.ring1} ${roles.warning.edge}`
    }
  }),
  solid: stylex.create({
    neutral: {
      [togglePressed.background]: roles.neutral.fill,
      [togglePressed.color]: roles.neutral.onFill,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    primary: {
      [togglePressed.background]: roles.primary.fill,
      [togglePressed.color]: roles.primary.onFill,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    critical: {
      [togglePressed.background]: roles.critical.fill,
      [togglePressed.color]: roles.critical.onFill,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    positive: {
      [togglePressed.background]: roles.positive.fill,
      [togglePressed.color]: roles.positive.onFill,
      [togglePressed.edge]: colors.borderNeutralFaded
    },
    warning: {
      [togglePressed.background]: roles.warning.fill,
      [togglePressed.color]: roles.warning.onFill,
      [togglePressed.edge]: colors.borderNeutralFaded
    }
  })
}

export const toggleVariants = stylex.create({
  ghost: {},
  solid: {},
  outline: {
    borderColor: {
      default: colors.borderNeutralFaded,
      '[data-pressed]:not([data-disabled])': togglePressed.edge,
      ':disabled': colors.borderDisabled,
      '[data-disabled]': colors.borderDisabled
    },
    borderStyle: 'solid',
    borderWidth: stroke.ring1
  }
})

// sm, md, and lg take height and type from `controlSizes`; the toggle keeps its own padding and
// is at least as wide as it is tall.
export const toggleSizes = stylex.create({
  xs: {
    fontSize: fontSize.caption1,
    height: unit.x7,
    minWidth: unit.x7,
    paddingInline: unit.x2
  },
  sm: { minWidth: unit.x8, paddingInline: unit.x2 },
  md: { minWidth: unit.x9, paddingInline: unit.x2 },
  lg: { minWidth: unit.x10, paddingInline: unit.x2 }
})
