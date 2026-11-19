import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { fontFamily, fontWeight } from '../../styles/tokens.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'

export const menubarStyles = stylex.create({
  root: {
    alignItems: 'center',
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.large,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    display: 'flex',
    fontFamily: fontFamily.body,
    gap: unit.x0_5,
    // The height comes from `controlSizes`: the triggers fill what the border and padding leave.
    paddingBlock: unit.x0_5,
    paddingInline: unit.x0_5
  },
  trigger: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutral,
      '[data-popup-open]': colors.backgroundNeutral
    },
    borderRadius: radius.small,
    borderStyle: 'none',
    color: colors.foregroundNeutral,
    cursor: 'default',
    display: 'flex',
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: 'inherit',
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    paddingInline: unit.x1_5,
    userSelect: 'none'
  },
  // Menubar popups size to their content, not the trigger.
  content: {
    width: 'max-content'
  }
})
