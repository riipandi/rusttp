import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { container } from '../../styles/tokens.stylex'
import { unit, radius, zIndex } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'

export const dialogStyles = stylex.create({
  overlay: {
    backgroundColor: `color-mix(in srgb, ${colors.black} 50%, transparent)`,
    inset: 0,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    position: 'fixed',
    transitionDuration: duration.medium,
    transitionProperty: 'opacity',
    transitionTimingFunction: easing.decelerate,
    zIndex: zIndex.overlay
  },
  // `blurredOverlay`: the page behind the backdrop is blurred by one unit step.
  overlayBlurred: { backdropFilter: `blur(${unit.x1})` },
  content: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.xxlarge,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x4,
    left: '50%',
    maxWidth: `calc(100% - ${unit.x8})`,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    padding: unit.x6,
    position: 'fixed',
    top: '50%',
    transform: {
      default: 'translate(-50%, -50%) scale(1)',
      '[data-starting-style]': 'translate(-50%, -50%) scale(0.97)',
      '[data-ending-style]': 'translate(-50%, -50%) scale(0.97)'
    },
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.decelerate,
    width: container.xxlarge,
    zIndex: zIndex.modal
  },
  // `size='sm'`: a narrower dialog; `md` is the base width.
  contentSmall: { width: container.large },
  // Position only: the look is `CloseButton`.
  close: {
    position: 'absolute',
    right: unit.x3,
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
    fontSize: fontSize.body1,
    fontWeight: fontWeight.semibold,
    lineHeight: fontLineHeight.body1,
    margin: 0
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    marginTop: unit.x1,
    margin: 0
  }
})
