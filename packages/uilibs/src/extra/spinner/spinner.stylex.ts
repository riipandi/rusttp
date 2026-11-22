import * as stylex from '@stylexjs/stylex'

export const spinnerSpin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
})

export const spinnerStyles = stylex.create({
  root: {
    // Slowed, not stopped: a stopped spinner reads as a frozen page.
    animationDuration: { default: '1s', '@media (prefers-reduced-motion: reduce)': '3s' },
    animationIterationCount: 'infinite',
    animationName: spinnerSpin,
    animationTimingFunction: 'linear',
    flexShrink: 0
  }
})
