import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { container } from '../../styles/tokens.stylex'
import { unit, radius, zIndex } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

export const dialogStyles = stylex.create({
  overlay: {
    inset: 0,
    position: 'fixed',
    zIndex: zIndex.overlay
  },
  // The scrolling outer box: a popup taller than the window scrolls as a whole, centered when it
  // fits (`margin: auto` on the popup) and top-aligned, never cut off, when it does not.
  viewport: {
    display: 'flex',
    inset: 0,
    overflowY: 'auto',
    paddingBlock: unit.x4,
    position: 'fixed',
    zIndex: zIndex.modal
  },
  content: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.xxlarge,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x4,
    margin: 'auto',
    maxWidth: `calc(100% - ${unit.x8})`,
    padding: unit.x6,
    position: 'relative',
    transform: {
      default: 'scale(1)',
      '[data-starting-style]': 'scale(0.97)',
      '[data-ending-style]': 'scale(0.97)'
    },
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.decelerate,
    width: container.xxlarge
  },
  // `size='small'`: a narrower dialog; `medium` is the base width.
  contentSmall: { width: container.large },
  // Position only: the look is `CloseButton`.
  close: {
    insetInlineEnd: unit.x3,
    position: 'absolute',
    top: unit.x3
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1_5
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    gap: unit.x2,
    justifyContent: 'flex-end'
  },
  title: {
    fontWeight: fontWeight.semibold,
    margin: 0
  }
})
