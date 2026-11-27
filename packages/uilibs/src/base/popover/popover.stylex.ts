import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { container } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const popoverStyles = stylex.create({
  // Closed pose (Base UI's [data-starting-style]/[data-ending-style] frames):
  // faded, slightly shrunk, nudged toward the anchor. [data-side] sets the
  // nudge direction; the transition animates entry and exit through it.
  // Shared frames live in `popupFx` (positioner/shift/fade/pose).
  popup: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    outline: 'none',
    width: container.small
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1_5
  },
  title: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    lineHeight: fontLineHeight.body2,
    margin: 0
  }
})

// `padding` counts `unit` steps, as Reshaped's number does: each step is a static style on the unit token.
export const popoverPadding = stylex.create({
  0: { padding: 0 },
  0.5: { padding: unit.x0_5 },
  1: { padding: unit.x1 },
  1.5: { padding: unit.x1_5 },
  2: { padding: unit.x2 },
  3: { padding: unit.x3 },
  4: { padding: unit.x4 },
  5: { padding: unit.x5 },
  6: { padding: unit.x6 },
  7: { padding: unit.x7 },
  8: { padding: unit.x8 },
  9: { padding: unit.x9 },
  10: { padding: unit.x10 },
  12: { padding: unit.x12 },
  14: { padding: unit.x14 },
  16: { padding: unit.x16 },
  18: { padding: unit.x18 },
  20: { padding: unit.x20 }
})

// `borderRadius`: `medium` is the base popup's radius.
export const popoverRadii = stylex.create({
  medium: { borderRadius: radius.medium },
  large: { borderRadius: radius.large }
})
