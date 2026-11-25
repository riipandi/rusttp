import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke, zIndex } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily } from '../../styles/tokens.stylex'

/**
 * A slot is a square the height of the control, as in `controlSizes`, and shrinks when the row is
 * narrower than the slots (a 6-digit code on a 320px screen) instead of overflowing it.
 */
export const otpFieldSlotSizes = stylex.create({
  small: { width: unit.x8 },
  medium: { width: unit.x9 },
  large: { width: unit.x10 }
})

export const otpFieldStyles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    fontFamily: fontFamily.body,
    gap: unit.x2,
    maxWidth: '100%'
  },
  group: {
    alignItems: 'center',
    display: 'flex',
    minWidth: 0
  },
  // Slots fuse into one field: shared vertical borders, a leading border only
  // on the first slot, and end radii — joined-slot look. The box and state
  // model come from `controlBase`; a focused slot draws above its neighbors.
  slot: {
    borderEndStartRadius: { default: 0, ':first-child': radius.large },
    borderEndEndRadius: { default: 0, ':last-child': radius.large },
    borderStartStartRadius: { default: 0, ':first-child': radius.large },
    borderStartEndRadius: { default: 0, ':last-child': radius.large },
    marginInlineStart: { default: `calc(-1 * ${stroke.ring1})`, ':first-child': 0 },
    flexShrink: 1,
    minWidth: 0,
    padding: 0,
    position: 'relative',
    textAlign: 'center',
    zIndex: { default: zIndex.base, ':focus': zIndex.raised }
  },
  // Names the field for its first slot without taking space in the row.
  hiddenLabel: {
    borderWidth: 0,
    clipPath: 'inset(50%)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1
  },
  separator: {
    alignItems: 'center',
    color: colors.foregroundNeutralFaded,
    display: 'flex'
  }
})
