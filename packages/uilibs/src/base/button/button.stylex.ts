import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const buttonStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.medium,
    borderStyle: 'none',
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x2,
    justifyContent: 'center',
    lineHeight: fontLineHeight.body2,
    position: 'relative',
    textDecoration: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  },
  // Loading: the label stays (it names the button and holds the width) but is
  // hidden under a centered spinner, and the button reads as busy, not disabled.
  loading: {
    cursor: 'progress',
    opacity: 1
  },
  content: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: 'inherit',
    justifyContent: 'center'
  },
  contentHidden: {
    opacity: 0
  },
  spinner: {
    alignItems: 'center',
    display: 'flex',
    insetBlock: 0,
    insetInline: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute'
  }
})

export const buttonVariants = stylex.create({
  primary: {
    backgroundColor: {
      default: colors.backgroundPrimary,
      ':hover:not(:disabled)': colors.backgroundPrimaryHighlighted
    },
    color: colors.onBrand
  },
  secondary: {
    backgroundColor: {
      default: colors.backgroundNeutral,
      ':hover:not(:disabled)': colors.backgroundNeutralHighlighted
    },
    color: colors.foregroundNeutral
  },
  outline: {
    backgroundColor: {
      default: colors.backgroundPage,
      ':hover:not(:disabled)': colors.backgroundNeutralFaded
    },
    borderColor: colors.borderNeutralFaded,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: {
      default: colors.foregroundNeutral,
      ':hover:not(:disabled)': colors.foregroundNeutral
    }
  },
  ghost: {
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:disabled)': colors.backgroundNeutralFaded
    },
    color: {
      default: colors.foregroundNeutral,
      ':hover:not(:disabled)': colors.foregroundNeutral
    }
  }
})

/**
 * `tone='critical'` recolors a variant: the filled variants (`primary`, `secondary`) become the
 * solid critical fill, the quiet ones (`outline`, `ghost`) keep their shape and take the critical
 * text color. Compose it after the variant.
 */
export const buttonCriticalTone = stylex.create({
  filled: {
    backgroundColor: {
      default: colors.backgroundCritical,
      ':hover:not(:disabled)': colors.backgroundCriticalHighlighted
    },
    color: colors.onBackgroundCritical
  },
  quiet: {
    backgroundColor: {
      default: null,
      ':hover:not(:disabled)': colors.backgroundCriticalFaded
    },
    borderColor: colors.borderCritical,
    color: {
      default: colors.foregroundCritical,
      ':hover:not(:disabled)': colors.foregroundCritical
    }
  }
})

export const buttonSizes = stylex.create({
  xs: { fontSize: fontSize.caption1, gap: unit.x1, height: unit.x7, paddingInline: unit.x2 },
  // sm, md, and lg take height and type from `controlSizes`; only the padding is a button's own.
  sm: { paddingInline: unit.x3 },
  md: { paddingInline: unit.x4 },
  lg: { paddingInline: unit.x6 },
  'icon-xs': { height: unit.x7, paddingInline: 0, width: unit.x7 },
  'icon-sm': { height: unit.x8, paddingInline: 0, width: unit.x8 },
  'icon-md': { height: unit.x9, paddingInline: 0, width: unit.x9 },
  'icon-lg': { height: unit.x10, paddingInline: 0, width: unit.x10 }
})
