import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { breakpoints, container, stroke } from '../../styles/tokens.stylex'
import { unit, radius, zIndex } from '../../styles/tokens.stylex'
import { duration, easing } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const alertDialogStyles = stylex.create({
  overlay: {
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
    padding: unit.x4,
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
    zIndex: zIndex.modal
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
      [breakpoints.medium]: 'left'
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
    borderBottomLeftRadius: radius.xxlarge,
    borderBottomRightRadius: radius.xxlarge,
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

export const alertDialogSizes = stylex.create({
  md: {
    width: {
      default: container.medium,
      [breakpoints.medium]: container.large
    }
  },
  sm: {
    width: container.medium
  }
})
