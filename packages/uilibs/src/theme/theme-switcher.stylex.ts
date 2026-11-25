import * as stylex from '@stylexjs/stylex'
import { duration, easing } from '../styles/tokens.stylex'

export const themeSwitcherStyles = stylex.create({
  // The three icons sit on one another; the current theme's is the one that shows.
  glyph: (size: number | string) => ({
    display: 'inline-block',
    flexShrink: 0,
    height: size,
    position: 'relative',
    width: size
  }),
  icon: {
    alignItems: 'center',
    display: 'flex',
    inset: 0,
    justifyContent: 'center',
    position: 'absolute',
    transitionProperty: 'opacity, transform',
    transitionDuration: {
      default: duration.medium,
      // Reduced motion swaps the icon at once: no fade, no turn.
      '@media (prefers-reduced-motion: reduce)': '0s'
    },
    transitionTimingFunction: easing.standard
  },
  shown: {
    opacity: 1,
    transform: 'rotate(0deg) scale(1)'
  },
  hidden: {
    opacity: 0,
    transform: 'rotate(-90deg) scale(0.5)'
  }
})
