import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { breakpoints, container, stroke } from '../../styles/tokens.stylex'
import { unit, radius, zIndex } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight } from '../../styles/tokens.stylex'

export const alertDialogStyles = stylex.create({
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
    padding: unit.x4,
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
    transitionTimingFunction: easing.decelerate
  },
  header: {
    alignItems: {
      default: 'center',
      [breakpoints.medium]: 'flex-start'
    },
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1_5,
    textAlign: {
      default: 'center',
      [breakpoints.medium]: 'start'
    }
  },
  media: {
    alignItems: 'center',
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.medium,
    display: 'inline-flex',
    height: unit.x10,
    justifyContent: 'center',
    marginBottom: unit.x2,
    width: unit.x10
  },
  footer: {
    backgroundColor: `color-mix(in srgb, ${colors.backgroundNeutral} 50%, transparent)`,
    borderEndEndRadius: radius.xxlarge,
    borderEndStartRadius: radius.xxlarge,
    borderTopColor: colors.borderNeutralFaded,
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1,
    display: 'flex',
    flexDirection: {
      default: 'column-reverse',
      [breakpoints.medium]: 'row'
    },
    gap: unit.x2,
    justifyContent: {
      default: 'stretch',
      [breakpoints.medium]: 'flex-end'
    },
    marginBottom: `calc(-1 * ${unit.x4})`,
    marginInline: `calc(-1 * ${unit.x4})`,
    padding: unit.x4
  },
  title: {
    fontWeight: fontWeight.semibold,
    margin: 0
  }
})

export const alertDialogSizes = stylex.create({
  medium: {
    width: {
      default: container.medium,
      [breakpoints.medium]: container.large
    }
  },
  small: {
    width: container.medium
  }
})
