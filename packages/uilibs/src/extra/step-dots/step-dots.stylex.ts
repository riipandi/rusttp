import * as stylex from '@stylexjs/stylex'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { duration, easing, radius, unit } from '../../styles/tokens.stylex'

// The active dot takes the fill of Progress (`progressColors` in `base/progress/progress.stylex`),
// so a role reads alike in both. The other dots take `borderControl`, not Progress's track color:
// a track is the empty part of a bar, but a dot says there is another step, so it must show
// against the page (3:1, WCAG 1.4.11).

export const stepDotsStyles = stylex.create({
  // The window clips the dots and the padding is where a cut-off dot fades out, so the first and
  // last dot sit clear of the fade and nothing hides behind it. The negative margin cancels the
  // padding in the layout.
  root: {
    boxSizing: 'content-box',
    display: 'inline-flex',
    lineHeight: 0,
    marginInline: `calc(-1 * ${unit.x4})`,
    overflow: 'hidden',
    paddingInline: unit.x4,
    verticalAlign: 'top'
  },
  windowed: {
    maskImage: `linear-gradient(to right, transparent 0, ${fixedColors.black} ${unit.x4}, ${fixedColors.black} calc(100% - ${unit.x4}), transparent 100%)`
  },
  track: {
    display: 'inline-flex',
    flexShrink: 0,
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'margin-inline-start',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    transitionTimingFunction: easing.decelerate
  },
  dot: {
    backgroundColor: {
      default: colors.borderControl,
      '@media (forced-colors: active)': 'GrayText'
    },
    borderRadius: radius.full,
    flexShrink: 0,
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'background-color, width',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    transitionTimingFunction: easing.decelerate
  },
  // Pulls the first visible dot of a long row to the start of the window; `steps` counts `unit`
  // steps and follows the active index, so it is known only at run time.
  shift: (steps: number) => ({ marginInlineStart: `calc(${steps} * ${unit.x1})` })
})

// A dot and the gap after it are the same step. The window is seven dots, six gaps, and the
// active dot's extra width, so it never grows past what a long row shows.
export const stepDotsSizes = stylex.create({
  smallRoot: { maxWidth: `calc(13 * ${unit.x1_5} + (${unit.x4} - ${unit.x1_5}))` },
  mediumRoot: { maxWidth: `calc(13 * ${unit.x2} + (${unit.x6} - ${unit.x2}))` },
  smallTrack: { gap: unit.x1_5 },
  mediumTrack: { gap: unit.x2 },
  smallDot: { height: unit.x1_5, width: unit.x1_5 },
  mediumDot: { height: unit.x2, width: unit.x2 },
  smallActive: { width: unit.x4 },
  mediumActive: { width: unit.x6 }
})

// White on a photo or a dark surface, the same in both themes, like Button `media`.
export const stepDotsMedia = stylex.create({
  idle: {
    backgroundColor: {
      default: `color-mix(in srgb, ${fixedColors.white} 50%, transparent)`,
      '@media (forced-colors: active)': 'GrayText'
    }
  },
  active: {
    backgroundColor: { default: fixedColors.white, '@media (forced-colors: active)': 'Highlight' }
  }
})
