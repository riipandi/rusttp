// The look shared by every page of the `(auth)` group: the split layout (see `routes/(auth)/route.tsx`)
// and the form column its pages fill.
import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { duration, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '#/styles/constants.stylex'

export const styles = stylex.create({
  split: {
    minHeight: '100dvh',
    display: 'grid',
    gridTemplateColumns: {
      // `minmax(0, …)`: a bare `1fr` is `minmax(auto, 1fr)`, so a wide child (a six-slot code)
      // would stretch the column past the screen instead of shrinking.
      default: 'minmax(0, 1fr)',
      [breakpoints.wide]: 'minmax(22rem, 5fr) minmax(0, 7fr)'
    },
    backgroundColor: colors.backgroundPage,
    color: colors.foregroundNeutral
  },
  panel: {
    display: {
      default: 'none',
      [breakpoints.wide]: 'flex'
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
      [breakpoints.wide]: 'none'
    }
  },
  formWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: unit.x8,
    width: '100%',
    maxWidth: '26rem',
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
    gap: unit.x3
  },
  links: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: unit.x2,
    fontSize: fontSize.body2
  },
  // First and last name side by side, stacked on a narrow screen so a message has room.
  nameRow: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr 1fr',
      [breakpoints.narrow]: '1fr'
    },
    gap: {
      default: unit.x3,
      [breakpoints.narrow]: unit.x5
    }
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
      default: 'currentColor',
      ':hover': 'currentColor'
    },
    textDecorationThickness: { default: '1px', ':hover': '2px' },
    textUnderlineOffset: '0.25em',
    transitionDuration: duration.fast,
    transitionProperty: 'color, text-decoration-thickness'
  },
  // A button that reads as one of the page's links (a placeholder action, not a navigation).
  linkButton: {
    padding: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit'
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
    textDecorationColor: 'currentColor',
    textDecorationThickness: { default: '1px', ':hover': '2px' },
    textUnderlineOffset: '0.25em',
    transitionDuration: duration.fast,
    transitionProperty: 'text-decoration-thickness'
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
