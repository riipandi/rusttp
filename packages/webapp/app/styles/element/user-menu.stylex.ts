import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { duration, fontSize, fontWeight, radius, unit } from 'uilibs/styles/tokens.stylex'

const narrow = '@media (max-width: 767px)'

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
  // The whole account row is the target: it fills the sidebar, takes the hover and open tint, and
  // collapses to the bare avatar on narrow screens, where the sidebar is a top bar.
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: unit.x1_5,
    width: { default: '100%', [narrow]: 'auto' },
    height: { default: unit.x12, [narrow]: unit.x8 },
    minWidth: 0,
    paddingInline: { default: unit.x1_5, [narrow]: 0 },
    borderRadius: { default: radius.medium, [narrow]: '50%' },
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutralFaded,
      ':where([data-popup-open])': colors.backgroundNeutralFaded
    },
    textAlign: 'start'
  },
  rowIdentity: {
    display: { default: 'flex', [narrow]: 'none' },
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
    fontSize: fontSize.caption1
  },
  rowChevron: {
    display: { default: 'flex', [narrow]: 'none' },
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
