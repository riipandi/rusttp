import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily } from '../../styles/tokens.stylex'

/** A slot is a square the height of the control, as in `controlSizes`. */
export const otpFieldSlotSizes = stylex.create({
  sm: { width: unit.x8 },
  md: { width: unit.x9 },
  lg: { width: unit.x10 }
})

export const otpFieldStyles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    fontFamily: fontFamily.body,
    gap: unit.x2
  },
  group: {
    alignItems: 'center',
    display: 'flex'
  },
  // Slots fuse into one field: shared vertical borders, a leading border only
  // on the first slot, and end radii — joined-slot look. The box and state
  // model come from `controlBase`; a focused slot draws above its neighbors.
  slot: {
    borderBottomLeftRadius: { default: 0, ':first-child': radius.large },
    borderBottomRightRadius: { default: 0, ':last-child': radius.large },
    borderTopLeftRadius: { default: 0, ':first-child': radius.large },
    borderTopRightRadius: { default: 0, ':last-child': radius.large },
    marginInlineStart: { default: `calc(-1 * ${stroke.ring1})`, ':first-child': 0 },
    padding: 0,
    position: 'relative',
    textAlign: 'center',
    zIndex: { default: 0, ':focus': 1 }
  },
  separator: {
    alignItems: 'center',
    color: colors.foregroundNeutralFaded,
    display: 'flex'
  }
})
