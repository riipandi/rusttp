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
  // The whole account row is the target: it fills the sidebar and takes the hover and open tint.
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: unit.x3,
    width: '100%',
    height: unit.x12,
    minWidth: 0,
    // The chevron glyph has about 5px of its own room on the right, so the end padding is smaller
    // and the avatar and the chevron sit the same distance from the row's edges.
    paddingInlineStart: unit.x3,
    paddingInlineEnd: unit.x2,
    borderRadius: radius.medium,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutralFaded,
      ':where([data-popup-open])': colors.backgroundNeutralFaded
    },
    textAlign: 'start'
  },
  rowIdentity: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
    fontSize: fontSize.caption1,
    lineHeight: 1.3
  },
  rowChevron: {
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
  // The sidebar's menu is as wide as the row that opened it; a long name or email truncates.
  menuRow: {
    minWidth: 0,
    maxWidth: 'none',
    width: 'var(--anchor-width)'
  },
  menuLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x0_5,
    paddingBlock: unit.x2
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
