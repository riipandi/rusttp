import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { duration } from '../../styles/tokens.stylex'

export const scrollAreaStyles = stylex.create({
  root: {
    position: 'relative'
  },
  viewport: {
    borderRadius: 'inherit',
    height: '100%',
    width: '100%'
  },
  // Overlay scrollbar: hidden at rest, fades in while hovering or scrolling.
  // The delay only applies to the fade-out, so appearing is immediate but
  // disappearing waits a beat after the pointer leaves.
  scrollbar: {
    display: 'flex',
    opacity: {
      default: 0,
      '[data-hovering]': 1,
      '[data-scrolling]': 1
    },
    padding: stroke.ring1,
    touchAction: 'none',
    transitionDelay: {
      default: duration.slow,
      '[data-hovering]': '0s',
      '[data-scrolling]': '0s'
    },
    transitionDuration: duration.fast,
    transitionProperty: 'opacity',
    userSelect: 'none'
  },
  thumb: {
    backgroundColor: colors.borderNeutralFaded,
    borderRadius: radius.full,
    flex: 1,
    position: 'relative'
  }
})

// `scrollbarDisplay`: `hover` is the base style above; the others replace its opacity.
export const scrollAreaDisplays = stylex.create({
  scroll: {
    opacity: { default: 0, '[data-scrolling]': 1 },
    transitionDelay: { default: duration.slow, '[data-scrolling]': '0s' }
  },
  visible: { opacity: 1 },
  hidden: { opacity: 0, pointerEvents: 'none' }
})

export const scrollAreaScrollbarOrientations = stylex.create({
  vertical: {
    height: '100%',
    width: unit.x3
  },
  horizontal: {
    flexDirection: 'column',
    height: unit.x3
  }
})

/**
 * The fade mask: one layer per edge, intersected by `mask-composite`. A layer ramps from clear at
 * its edge to opaque at `size` (the `--scroll-area-fade-*` length the scroll timeline animates), in
 * four stops that follow a smoothstep (0, 26%, 74%, 100% at thirds of the length). The stops are mask
 * alpha only: the color channels are never drawn. `--scroll-area-fade-inline-start` is the fade at
 * the scroll origin, which is the right edge in right-to-left, and a gradient has no logical
 * direction, so the rtl rule hands the two inline layers the other way round.
 */
const fadeRamp = (to: 'top' | 'bottom' | 'left' | 'right', size: string) =>
  `linear-gradient(to ${to}, rgb(0 0 0 / 0%) 0, rgb(0 0 0 / 26%) calc(${size} / 3), rgb(0 0 0 / 74%) calc(${size} * 2 / 3), rgb(0 0 0 / 100%) ${size})`

const fadeMask = (inlineStart: 'left' | 'right', inlineEnd: 'left' | 'right') =>
  [
    fadeRamp('bottom', 'var(--scroll-area-fade-block-start)'),
    fadeRamp('top', 'var(--scroll-area-fade-block-end)'),
    fadeRamp(inlineStart, 'var(--scroll-area-fade-inline-start)'),
    fadeRamp(inlineEnd, 'var(--scroll-area-fade-inline-end)')
  ].join(', ')

export const scrollAreaFadeStyles = stylex.create({
  fade: {
    '@supports (animation-timeline: scroll(self block))': {
      animationFillMode: 'both',
      animationName:
        'scroll-area-fade-block-start, scroll-area-fade-block-end, scroll-area-fade-inline-start, scroll-area-fade-inline-end',
      animationTimeline:
        'scroll(self block), scroll(self block), scroll(self inline), scroll(self inline)',
      animationRange: '0 32px, calc(100% - 32px) 100%, 0 32px, calc(100% - 32px) 100%',
      animationTimingFunction: 'linear',
      maskComposite: 'intersect',
      maskImage: {
        default: fadeMask('right', 'left'),
        ':dir(rtl)': fadeMask('left', 'right')
      }
    }
  }
})
