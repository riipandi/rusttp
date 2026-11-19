import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { duration, fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

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
