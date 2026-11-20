import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { container } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily } from '../../styles/tokens.stylex'

// The popup and the trigger are the context menu's own; its items are the dropdown's.
export const contextMenuStyles = stylex.create({
  trigger: {
    userSelect: 'none'
  },
  // Closed pose (Base UI's [data-starting-style]/[data-ending-style] frames):
  // faded, slightly shrunk, nudged toward the anchor. [data-side] sets the
  // nudge direction; the transition animates entry and exit through it.
  // Shared frames live in `popupFx` (positioner/shift/fade/pose).
  popup: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    maxHeight: 'var(--available-height)',
    minWidth: container.xxsmall,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    outline: 'none',
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingBlock: unit.x1
  },
  subPopup: {
    width: 'max-content'
  }
})
