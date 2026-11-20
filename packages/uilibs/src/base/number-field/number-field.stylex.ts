import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily } from '../../styles/tokens.stylex'
import { duration } from '../../styles/tokens.stylex'

/** Width of a side stepper: a square the height of the control, as in `controlSizes`. */
export const numberFieldButtonSizes = stylex.create({
  sm: { width: unit.x8 },
  md: { width: unit.x9 },
  lg: { width: unit.x10 }
})

export const numberFieldStyles = stylex.create({
  root: {
    fontFamily: fontFamily.body
  },
  // The box, state model, and size come from `controlBase` (root and
  // within) and `controlSizes`; padding stays on the input and buttons.
  group: {
    alignItems: 'stretch',
    display: 'flex',
    paddingInline: 0,
    width: '100%'
  },
  input: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: colors.foregroundNeutral,
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 'inherit',
    minWidth: 0,
    outline: 'none',
    padding: 0,
    textAlign: 'center'
  },
  button: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:disabled)': colors.backgroundNeutral
    },
    borderStyle: 'none',
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover:not(:disabled)': colors.foregroundNeutral
    },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'flex',
    justifyContent: 'center',
    outline: 'none',
    padding: 0,
    transitionDuration: duration.fast,
    transitionProperty: 'background-color, color'
  },
  decrement: {
    borderBottomLeftRadius: `calc(${radius.medium} - ${stroke.ring1})`,
    borderRightColor: colors.borderNeutralFaded,
    borderRightStyle: 'solid',
    borderRightWidth: stroke.ring1,
    borderTopLeftRadius: `calc(${radius.medium} - ${stroke.ring1})`
  },
  increment: {
    borderBottomRightRadius: `calc(${radius.medium} - ${stroke.ring1})`,
    borderLeftColor: colors.borderNeutralFaded,
    borderLeftStyle: 'solid',
    borderLeftWidth: stroke.ring1,
    borderTopRightRadius: `calc(${radius.medium} - ${stroke.ring1})`
  },
  // Stacked controls: a narrow column pinned to the end edge with two
  // half-height buttons on top of each other (chevron up / chevron down).
  // It is a normal flex item (not absolute) so it reserves space next to
  // the input instead of covering it.
  controls: {
    alignItems: 'stretch',
    borderBottomRightRadius: `calc(${radius.medium} - ${stroke.ring1})`,
    borderLeftColor: colors.borderNeutralFaded,
    borderLeftStyle: 'solid',
    borderLeftWidth: stroke.ring1,
    borderTopRightRadius: `calc(${radius.medium} - ${stroke.ring1})`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden'
  },
  controlStacked: {
    width: unit.x6
  },
  controlStackedFirst: {
    borderTopRightRadius: `calc(${radius.medium} - ${stroke.ring1})`
  },
  controlStackedLast: {
    borderBottomRightRadius: `calc(${radius.medium} - ${stroke.ring1})`,
    borderTopColor: colors.borderNeutralFaded,
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1
  }
})
