import * as stylex from '@stylexjs/stylex'
import { colors } from './colors.stylex'
import {
  duration,
  fontFamily,
  fontLineHeight,
  fontSize,
  radius,
  stroke,
  unit
} from './tokens.stylex'

/** The shared control size scale: a Button and a text control of one size are one height. */
export type ControlSize = 'sm' | 'md' | 'lg'

/** The scale plus `xs` (28px), which only dense press targets have: Button, Toggle, and Tabs. */
export type DenseControlSize = 'xs' | ControlSize

/**
 * Height, inline padding, and type of a control (`sm` 32, `md` 36, `lg` 40).
 * Compose after `controlBase` or `controlPress` and before the component's
 * own style; a component that needs a wider padding (Button) overrides it
 * in its own size style.
 */
export const controlSizes = stylex.create({
  sm: {
    fontSize: fontSize.body2,
    height: unit.x8,
    lineHeight: fontLineHeight.body2,
    paddingInline: unit.x3
  },
  md: {
    fontSize: fontSize.body2,
    height: unit.x9,
    lineHeight: fontLineHeight.body2,
    paddingInline: unit.x3
  },
  lg: {
    fontSize: fontSize.body1,
    height: unit.x10,
    lineHeight: fontLineHeight.body1,
    paddingInline: unit.x4
  }
})

/**
 * Text-entry controls (Input, Select, Combobox, Autocomplete, NumberField, Textarea, …):
 * surface, `borderControl` edge (3:1 for WCAG 1.4.11), radius, type, and the
 * state model — focus is the primary border plus a 2px inset outline, invalid
 * is the critical border, disabled is half opacity. Compose first, then
 * `controlSizes[size]`, then the component's own style.
 */
export const controlBase = stylex.create({
  root: {
    backgroundColor: colors.backgroundPage,
    borderColor: {
      default: colors.borderControl,
      ':focus-visible': colors.foregroundPrimary,
      '[data-invalid]': colors.borderCritical
    },
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundNeutral,
    cursor: { default: null, ':disabled': 'not-allowed', '[data-disabled]': 'not-allowed' },
    fontFamily: fontFamily.body,
    opacity: { default: 1, ':disabled': 0.5, '[data-disabled]': 0.5 },
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: `calc(-1 * ${stroke.ring1})`,
    transitionDuration: duration.fast,
    transitionProperty: 'background-color, border-color, color, opacity, outline-color'
  },
  /**
   * The same state model for a wrapper that holds the real input (InputGroup,
   * NumberField, InputPhone, Combobox chips): compose after `root`. Focus
   * and invalid are read from the descendants, disabled from the wrapper's
   * own `data-disabled` or a disabled input inside it; a disabled stepper or
   * addon button alone does not dim the field.
   */
  within: {
    borderColor: {
      default: colors.borderControl,
      ':has(:focus-visible)': colors.foregroundPrimary,
      '[data-invalid]': colors.borderCritical,
      ':has([data-invalid])': colors.borderCritical
    },
    opacity: {
      default: 1,
      '[data-disabled]': 0.5,
      ':has(input:disabled)': 0.5,
      ':has(textarea:disabled)': 0.5
    },
    outline: {
      default: 'none',
      ':has(:focus-visible)': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    }
  }
})

/** The fill of a text-entry control: `outline` is the bordered box, the rest drop the 3:1 edge at rest. */
export type ControlVariant = 'outline' | 'faded' | 'ghost' | 'headless'

const quietEdge = {
  default: 'transparent',
  ':focus-visible': colors.foregroundPrimary,
  '[data-invalid]': colors.borderCritical
} as const

const quietEdgeWithin = {
  default: 'transparent',
  ':has(:focus-visible)': colors.foregroundPrimary,
  '[data-invalid]': colors.borderCritical,
  ':has([data-invalid])': colors.borderCritical
} as const

/**
 * Compose after `controlBase.root` and `controlSizes`. `outline` is `controlBase` as it is. `faded`
 * is the neutral fill with no edge, `ghost` is transparent until hover, `headless` has no box at all
 * (for a control inside a container that draws one). They keep the focus ring and the critical edge
 * for invalid, but carry no 3:1 edge at rest, so they need a visible label.
 */
export const controlVariants = stylex.create({
  outline: {},
  faded: { backgroundColor: colors.backgroundNeutral, borderColor: quietEdge },
  ghost: {
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:disabled)': colors.backgroundNeutralFaded
    },
    borderColor: quietEdge
  },
  headless: { backgroundColor: 'transparent', borderColor: quietEdge }
})

/** The same for a wrapper that holds the real input (`controlBase.within`): compose after it. */
export const controlVariantsWithin = stylex.create({
  outline: {},
  faded: { backgroundColor: colors.backgroundNeutral, borderColor: quietEdgeWithin },
  ghost: {
    backgroundColor: { default: 'transparent', ':hover': colors.backgroundNeutralFaded },
    borderColor: quietEdgeWithin
  },
  headless: { backgroundColor: 'transparent', borderColor: quietEdgeWithin }
})

/**
 * Press targets (Button, Toggle, Tab, Checkbox, Radio, Switch, menu triggers):
 * the pointer cursor, half-opacity disabled state, and a 2px ring drawn
 * outside the box so it never clips a short label. Compose before the
 * component's own style.
 */
export const controlPress = stylex.create({
  root: {
    cursor: { default: 'pointer', ':disabled': 'not-allowed', '[data-disabled]': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.5, '[data-disabled]': 0.5 },
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: stroke.ring2,
    transitionDuration: duration.fast,
    transitionProperty: 'background-color, border-color, color, opacity'
  }
})
