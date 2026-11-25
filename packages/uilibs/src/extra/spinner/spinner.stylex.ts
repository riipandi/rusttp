import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { motionLoop } from '../../styles/tokens.stylex'

export const spinnerSpin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' }
})

export const spinnerStyles = stylex.create({
  root: {
    // Slowed, not stopped: a stopped spinner reads as a frozen page.
    animationDuration: {
      default: motionLoop.spin,
      '@media (prefers-reduced-motion: reduce)': motionLoop.spinSlow
    },
    animationIterationCount: 'infinite',
    animationName: spinnerSpin,
    animationTimingFunction: 'linear',
    flexShrink: 0
  }
})

// `inherit` has no style: the spinner draws in the text color around it.
export const spinnerColors = stylex.create({
  primary: { color: colors.foregroundPrimary },
  positive: { color: colors.foregroundPositive },
  warning: { color: colors.foregroundWarning },
  critical: { color: colors.foregroundCritical }
})
