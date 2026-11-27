import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { stroke, container, duration, easing, motionLoop } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const commandStyles = stylex.create({
  root: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.xxlarge,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    height: '100%',
    overflow: 'hidden',
    width: '100%'
  },
  // On the page the palette has the same fill as its surroundings, so it draws its own edge. In a
  // `CommandDialog` it does not: the dialog's ring is the edge, and a second one would double it.
  edge: {
    borderColor: colors.borderNeutral,
    borderStyle: 'solid',
    borderWidth: stroke.ring1
  },
  // Higher than center, where the eye goes first, and wide enough that the longest label and its
  // shortcut share a row. It opens by rising a few pixels and fading in, not by scaling: the box
  // is the focus, so it should not appear to swell.
  // Higher than center, where the eye goes first, and wide enough that the longest label and its
  // shortcut share a row. The box keeps the dialog's own centring and fade; the rise is `inner`.
  dialogContent: {
    borderRadius: radius.xxlarge,
    // The edge and shadow are the dialog's own: its 1px ring and `shadow.overlay`.
    gap: 0,
    // Sits a sixth of the window below the top instead of at its centre, and still fits under it.
    marginBlockEnd: 'auto',
    marginBlockStart: '15dvh',
    maxHeight: `calc(85dvh - ${unit.x8})`,
    overflow: 'hidden',
    padding: 0,
    // The box only fades, on the dialog's own timing (it does not scale in, so it cannot appear
    // to swell); the motion is `inner`'s.
    transform: 'none',
    width: container.xxlarge
  },
  // The content lifts a few pixels into place a beat after the box starts to fade in, so the frame
  // settles first and the rows follow; it leaves with the box, on the box's own timing, drifting up a touch.
  inner: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    opacity: {
      default: 1,
      [stylex.when.ancestor('[data-starting-style]')]: 0,
      [stylex.when.ancestor('[data-ending-style]')]: 0
    },
    translate: {
      default: '0 0',
      [stylex.when.ancestor('[data-starting-style]')]: '0 6px',
      [stylex.when.ancestor('[data-ending-style]')]: '0 -2px'
    },
    transitionDelay: {
      default: motionLoop.stagger,
      [stylex.when.ancestor('[data-ending-style]')]: '0ms',
      '@media (prefers-reduced-motion: reduce)': '0ms'
    },
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'opacity, translate',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: {
      default: easing.standard,
      [stylex.when.ancestor('[data-ending-style]')]: easing.decelerate
    }
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
    // Concentric with the box: its xxlarge corner (16px) minus the list's 6px padding is 10px.
    borderRadius: radius.large,
    color: {
      default: null,
      '[data-highlighted]': colors.foregroundNeutral,
      '[data-disabled]': colors.foregroundDisabled
    },
    cursor: 'default',
    display: 'flex',
    fontSize: fontSize.body2,
    gap: unit.x3,
    lineHeight: fontLineHeight.body2,
    minHeight: unit.x8,
    outline: 'none',
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
    marginInlineStart: 'auto'
  }
})
