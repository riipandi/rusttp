import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { stroke, container, duration, easing } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const commandStyles = stylex.create({
  root: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.xlarge,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    height: '100%',
    overflow: 'hidden',
    width: '100%'
  },
  // Higher than center, where the eye goes first, and wide enough that the longest label and its
  // shortcut share a row. It opens by rising a few pixels and fading in, not by scaling: the box
  // is the focus, so it should not appear to swell.
  // Higher than center, where the eye goes first, and wide enough that the longest label and its
  // shortcut share a row. The box keeps the dialog's own centring and fade; the rise is `inner`.
  dialogContent: {
    borderRadius: radius.xlarge,
    // A firmer edge than the dialog's own faded ring (which the dim overlay swallows) and a deeper
    // shadow under it: the palette floats over the page, so its outline has to read in both themes.
    // Two rings, the neutral border and a hairline of the page's lighter tone just inside it, so the
    // edge shows against a near-black overlay too. Set here, after the dialog's ring, so it wins.
    boxShadow: `0 0 0 ${stroke.ring1} ${colors.borderNeutral}, inset 0 0 0 ${stroke.ring1} ${colors.borderNeutralFaded}, 0 24px 48px -12px rgb(0 0 0 / 0.28), 0 8px 16px -8px rgb(0 0 0 / 0.16)`,
    gap: 0,
    maxHeight: `calc(100dvh - ${unit.x16})`,
    overflow: 'hidden',
    padding: 0,
    top: '15%',
    transform: 'translate(-50%, 0)',
    width: container.xxlarge
  },
  // The rise: the content inside the box lifts a few pixels as the box fades in, so the box never
  // appears to swell and the transform it centres with is left alone.
  inner: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    opacity: {
      default: 1,
      '[data-starting-style] > &': 0
    },
    translate: {
      default: '0 0',
      '[data-starting-style] > &': '0 8px'
    },
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'opacity, translate',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.standard
  },
  srOnly: {
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: `calc(-1 * ${stroke.ring1})`,
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px'
  },
  // The field is the room's header, not a box in it: a tall row with the icon, the text, and a
  // divider under it. No edge changes when it is focused (it is always the focus while the bar is
  // open), which is what kept drawing the eye to a ring.
  inputWrap: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    gap: unit.x3,
    height: unit.x12,
    // 20px: the list's 6px padding, a row's 12px, and the 2px the row's 20px icon slot centres its
    // 16px glyph by, so the search icon sits over the rows' icons.
    paddingInline: `calc(${unit.x1_5} + ${unit.x3} + ${unit.x0_5})`
  },
  inputIcon: {
    color: colors.foregroundNeutralFaded,
    flexShrink: 0
  },
  input: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: colors.foregroundNeutral,
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    height: '100%',
    lineHeight: fontLineHeight.body2,
    minWidth: 0,
    outline: 'none',
    padding: 0,
    '::placeholder': { color: colors.foregroundNeutralFaded }
  },
  // The list scrolls inside a `ScrollArea`, so the area carries the height and the list only pads.
  // The area is a column whose viewport shrinks to the cap (`min-height: 0` lets it), so the
  // list scrolls inside it instead of stretching the dialog.
  scroll: {
    display: 'flex',
    flex: '0 1 auto',
    flexDirection: 'column',
    minHeight: 0,
    maxHeight: `min(${container.xlarge}, 50dvh)`
  },
  list: {
    outline: 'none',
    padding: unit.x1_5,
    scrollPaddingBlock: unit.x1_5
  },
  empty: {
    // Base UI renders the element with no children while results exist —
    // hide it then so its padding doesn't reserve space.
    color: colors.foregroundNeutralFaded,
    display: { default: 'block', ':empty': 'none' },
    fontSize: fontSize.body2,
    paddingBlock: unit.x10,
    textAlign: 'center'
  },
  groupLabel: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    paddingBlockStart: unit.x2,
    paddingBlockEnd: unit.x1,
    paddingInline: unit.x3
  },
  // Rows are compact (32px) so more of the list fits, and lead with an icon slot so labels align.
  item: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      '[data-highlighted]': colors.backgroundNeutralFaded
    },
    borderRadius: radius.medium,
    color: {
      default: null,
      '[data-highlighted]': colors.foregroundNeutral,
      '[data-disabled]': colors.foregroundNeutralFaded
    },
    cursor: 'default',
    display: 'flex',
    fontSize: fontSize.body2,
    gap: unit.x3,
    lineHeight: fontLineHeight.body2,
    minHeight: unit.x8,
    outline: 'none',
    opacity: { default: 1, '[data-disabled]': 0.5 },
    paddingBlock: unit.x1,
    paddingInline: unit.x3,
    position: 'relative',
    transitionDuration: duration.fast,
    transitionProperty: 'background-color',
    userSelect: 'none'
  },
  // Inside the list: it spans the list's padding so the line meets both edges.
  separator: {
    marginBlock: unit.x1,
    marginInline: `calc(-1 * ${unit.x1_5})`,
    width: 'auto'
  },
  shortcut: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    letterSpacing: '0.1em',
    marginLeft: 'auto'
  }
})
