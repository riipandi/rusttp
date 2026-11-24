import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { radius } from '../../styles/tokens.stylex'

export const skeletonPulse = stylex.keyframes({
  '0%': { opacity: 1 },
  '50%': { opacity: 0.5 },
  '100%': { opacity: 1 }
})

export const skeletonStyles = stylex.create({
  root: {
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationName: { default: skeletonPulse, '@media (prefers-reduced-motion: reduce)': 'none' },
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.medium
  },
  // A size is a CSS length or a count of `unit` steps, known only at run time: a dynamic style.
  width: (value: string) => ({ width: value }),
  height: (value: string) => ({ height: value })
})

export const skeletonRadius = stylex.create({
  xsmall: { borderRadius: radius.xsmall },
  small: { borderRadius: radius.small },
  medium: { borderRadius: radius.medium },
  large: { borderRadius: radius.large },
  xlarge: { borderRadius: radius.xlarge },
  xxlarge: { borderRadius: radius.xxlarge },
  full: { borderRadius: radius.full },
  none: { borderRadius: radius.none }
})
