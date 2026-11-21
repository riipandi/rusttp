import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke, container } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { duration } from '../../styles/tokens.stylex'

export const sliderHaloShadow = `0 0 0 ${stroke.ring3} color-mix(in srgb, ${colors.foregroundPrimary} 50%, transparent)`

export const sliderStyles = stylex.create({
  control: {
    opacity: { default: 1, '[data-disabled]': 0.5 },
    alignItems: 'center',
    display: 'flex',
    position: 'relative',
    touchAction: 'none',
    userSelect: 'none'
  },
  controlDisabled: {
    opacity: 0.5,
    pointerEvents: 'none'
  },
  track: {
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.full,
    flexGrow: 1,
    // Forced colors drop backgrounds: the track gets an edge and the range a system color.
    outline: { default: 'none', '@media (forced-colors: active)': '1px solid CanvasText' },
    overflow: 'hidden',
    position: 'relative',
    userSelect: 'none'
  },
  range: {
    backgroundColor: {
      default: colors.backgroundPrimary,
      '@media (forced-colors: active)': 'Highlight'
    },
    userSelect: 'none'
  },
  thumb: {
    backgroundColor: colors.backgroundPage,
    borderColor: colors.foregroundPrimary,
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    boxShadow: {
      default: 'none',
      ':hover': sliderHaloShadow,
      // Base UI focuses a visually hidden input inside the thumb, never the thumb itself.
      ':has(:focus-visible)': sliderHaloShadow,
      ':active': sliderHaloShadow
    },
    flexShrink: 0,
    height: unit.x3,
    // The halo is a box-shadow, which forced colors remove: the focus ring is an outline there.
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: 'none',
        ':has(:focus-visible)': `${stroke.ring2} solid Highlight`
      }
    },
    outlineOffset: stroke.ring2,
    position: 'relative',
    transitionDuration: duration.fast,
    transitionProperty: 'box-shadow',
    userSelect: 'none',
    width: unit.x3,
    // The visible thumb is 12px; the pointer target is 24px (WCAG 2.5.8).
    '::after': {
      content: '""',
      insetBlock: `calc(-1 * ${unit.x1_5})`,
      insetInline: `calc(-1 * ${unit.x1_5})`,
      position: 'absolute'
    }
  }
})

export const sliderRootOrientations = stylex.create({
  horizontal: {
    width: '100%'
  },
  vertical: {
    height: '100%',
    minHeight: container.xxsmall
  }
})

export const sliderControlOrientations = stylex.create({
  horizontal: {
    width: '100%'
  },
  vertical: {
    flexDirection: 'column',
    height: '100%',
    minHeight: container.xxsmall
  }
})

export const sliderTrackOrientations = stylex.create({
  horizontal: {
    height: unit.x1,
    width: '100%'
  },
  vertical: {
    height: '100%',
    width: unit.x1
  }
})

export const sliderRangeOrientations = stylex.create({
  horizontal: {
    height: '100%'
  },
  vertical: {
    width: '100%'
  }
})
