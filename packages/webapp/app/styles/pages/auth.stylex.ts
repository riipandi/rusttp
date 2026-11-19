// The look shared by every page of the `(auth)` group: the split layout (see `routes/(auth)/route.tsx`)
// and the form column its pages fill.
import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { duration, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

// Same-file rule: StyleX only inlines `defineConsts` media keys declared where they are used.
export const breakpoints = stylex.defineConsts({
  large: '@media (min-width: 900px)'
})

export const styles = stylex.create({
  split: {
    minHeight: '100dvh',
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      [breakpoints.large]: 'minmax(22rem, 5fr) 7fr'
    },
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  },
  panel: {
    display: {
      default: 'none',
      [breakpoints.large]: 'flex'
    },
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: unit.x12,
    backgroundColor: colors.backgroundPageFaded,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.borderNeutralFaded
  },
  panelTitle: {
    margin: 0,
    maxWidth: '14ch',
    fontSize: fontSize.featured1,
    fontWeight: fontWeight.bold,
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
    textWrap: 'balance'
  },
  panelText: {
    margin: 0,
    marginBlockStart: unit.x3,
    maxWidth: '36ch',
    color: colors.foregroundNeutralFaded,
    lineHeight: 1.6
  },
  formSide: {
    display: 'flex',
    flexDirection: 'column',
    padding: unit.x6
  },
  topRow: {
    display: 'flex',
    alignItems: 'center'
  },
  theme: {
    marginInlineStart: 'auto'
  },
  mobileBrand: {
    display: {
      default: 'flex',
      [breakpoints.large]: 'none'
    }
  },
  formWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: unit.x8,
    width: '100%',
    maxWidth: '22rem',
    marginInline: 'auto',
    paddingBlock: unit.x10
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2
  },
  title: {
    margin: 0,
    fontSize: fontSize.featured2,
    fontWeight: fontWeight.bold,
    lineHeight: 1.15,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: 0,
    color: colors.foregroundNeutralFaded
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x5
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x5
  },
  submit: {
    width: '100%'
  },
  back: {
    alignSelf: 'center'
  },
  note: {
    margin: 0,
    color: colors.foregroundNeutralFaded,
    lineHeight: 1.6
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x2
  },
  links: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: unit.x2,
    fontSize: fontSize.body2
  },
  nameRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: unit.x3
  },
  fine: {
    margin: 0,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    lineHeight: 1.5
  },
  strong: {
    color: colors.foregroundNeutral,
    fontWeight: fontWeight.medium
  },
  // Navigation links: quiet until hovered, then the text darkens and the underline draws in.
  link: {
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral
    },
    textDecorationLine: 'underline',
    textDecorationColor: {
      default: 'transparent',
      ':hover': 'currentColor'
    },
    textUnderlineOffset: '0.25em',
    transitionDuration: duration.fast,
    transitionProperty: 'color, text-decoration-color'
  },
  // "Already have an account? Sign in": one centered line, the link a step stronger than the text.
  switch: {
    margin: 0,
    textAlign: 'center',
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2
  },
  linkStrong: {
    color: colors.foregroundNeutral,
    fontWeight: fontWeight.medium,
    textDecorationLine: 'underline',
    textDecorationColor: {
      default: 'transparent',
      ':hover': 'currentColor'
    },
    textUnderlineOffset: '0.25em',
    transitionDuration: duration.fast,
    transitionProperty: 'text-decoration-color'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'center',
    gap: unit.x1,
    fontSize: fontSize.body2
  },
  // The arrow of a back link nudges left while the link is hovered.
  backIcon: {
    transform: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'translateX(-3px)'
    },
    transitionDuration: duration.fast,
    transitionProperty: 'transform'
  }
})
