import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { duration, fontSize, fontWeight, radius, unit } from 'uilibs/styles/tokens.stylex'

export const styles = stylex.create({
  // The avatar is the whole control: no box behind it, a ring with a gap around it on hover (neutral)
  // and while the menu is open (brand).
  trigger: {
    borderRadius: '50%',
    height: unit.x8,
    width: unit.x8,
    backgroundColor: 'transparent',
    boxShadow: {
      default: 'none',
      ':hover': `0 0 0 2px ${colors.backgroundPage}, 0 0 0 3px ${colors.borderNeutral}`,
      '[data-popup-open]': `0 0 0 2px ${colors.backgroundPage}, 0 0 0 3px ${colors.foregroundPrimary}`
    },
    transitionDuration: duration.fast,
    transitionProperty: 'box-shadow'
  },
  // The admin trigger's box: transparent, because the avatar inside is what reacts (`avatar`); the
  // box only carries the focus ring, shaped like the avatar's hover state.
  bare: {
    height: unit.x8,
    width: unit.x8,
    borderRadius: radius.large,
    backgroundColor: 'transparent'
  },
  // The drawer's trigger: the avatar with a short name and a chevron, as wide as its content and
  // without a tint of its own. The avatar sits 4px from the start so its center is on the nav
  // icons' column.
  pill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: unit.x2,
    minWidth: 0,
    height: unit.x10,
    paddingInlineStart: unit.x1,
    paddingInlineEnd: unit.x2,
    borderRadius: radius.large,
    backgroundColor: 'transparent'
  },
  // The avatar turns from a circle into a squircle, with a ring, while the trigger is hovered or its
  // menu is open (the neutral ring, then the brand one). The trigger carries the default marker.
  avatar: {
    borderRadius: {
      default: '50%',
      [stylex.when.ancestor(':hover')]: radius.large,
      [stylex.when.ancestor(':where([data-popup-open])')]: radius.large
    },
    boxShadow: {
      default: 'none',
      [stylex.when.ancestor(':hover')]:
        `0 0 0 2px ${colors.backgroundPage}, 0 0 0 3px ${colors.borderNeutral}`,
      [stylex.when.ancestor(':where([data-popup-open])')]:
        `0 0 0 2px ${colors.backgroundPage}, 0 0 0 3px ${colors.foregroundPrimary}`
    },
    transitionDuration: duration.fast,
    transitionProperty: 'border-radius, box-shadow'
  },
  pillName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colors.foregroundNeutral,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium
  },
  pillChevron: {
    display: 'flex',
    flexShrink: 0
  },
  triggerInitials: {
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.semibold
  },
  menu: {
    minWidth: '14rem',
    maxWidth: '18rem'
  },
  menuLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x0_5,
    paddingBlock: unit.x2
  },
  // The drawer's menu: taller label and rows (a 36px row instead of 32px) and a smaller email line.
  menuLabelTouch: {
    paddingBlock: unit.x3
  },
  menuItemTouch: {
    paddingBlock: unit.x2
  },
  menuEmailSmall: {
    fontSize: fontSize.caption1
  },
  // The label wraps instead of truncating: a long address stays readable without a native tooltip
  // (a `title` pops over the first item).
  menuTextWrap: {
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
  },
  menuName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colors.foregroundNeutral,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.semibold
  },
  menuEmail: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colors.foregroundNeutralFaded
  }
})
