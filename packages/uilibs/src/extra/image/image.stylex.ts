import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { duration, easing, fontFamily, radius, unit } from '../../styles/tokens.stylex'

export const imageStyles = stylex.create({
  // The clip makes the corners round the picture and the fallback alike.
  root: {
    backgroundColor: colors.backgroundNeutralFaded,
    display: 'block',
    maxWidth: '100%',
    overflow: 'hidden',
    position: 'relative',
    width: '100%'
  },
  // In a box with a ratio the picture fills it; without one it keeps its own height.
  image: { display: 'block', opacity: 0, width: '100%' },
  // The transition lives on the loaded state, so the fade runs in and a new `src` resets without one.
  imageLoaded: {
    opacity: 1,
    transitionDuration: duration.medium,
    transitionProperty: { default: 'opacity', '@media (prefers-reduced-motion: reduce)': 'none' },
    transitionTimingFunction: easing.decelerate
  },
  imageFill: { height: '100%' },
  fallback: {
    alignItems: 'center',
    boxSizing: 'border-box',
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    fontFamily: fontFamily.body,
    justifyContent: 'center',
    padding: unit.x2,
    textAlign: 'center',
    width: '100%'
  },
  // With no ratio the box has no height of its own, so the fallback brings one.
  fallbackFree: { minHeight: unit.x20 },
  fallbackFill: { height: '100%', inset: 0, position: 'absolute' }
})

export const imageDisplayModes = stylex.create({
  cover: { objectFit: 'cover' },
  contain: { objectFit: 'contain' }
})

export const imageRadii = stylex.create({
  none: { borderRadius: radius.none },
  small: { borderRadius: radius.small },
  medium: { borderRadius: radius.medium },
  large: { borderRadius: radius.large },
  full: { borderRadius: radius.full }
})
