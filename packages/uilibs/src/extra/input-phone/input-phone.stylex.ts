import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { container, duration, radius, stroke, unit } from '../../styles/tokens.stylex'
import { fontFamily, fontSize } from '../../styles/tokens.stylex'

export const inputPhoneStyles = stylex.create({
  // The box and state model come from `controlBase.root` and `.within`, the
  // height and type from `controlSizes`; the padding sits on the digits and
  // the country trigger.
  root: {
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    minWidth: 0,
    paddingInline: 0,
    position: 'relative',
    width: '100%'
  },
  control: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: radius.none,
    borderStyle: 'none',
    borderWidth: 0,
    boxSizing: 'border-box',
    color: colors.foregroundNeutral,
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 'inherit',
    height: '100%',
    lineHeight: 'inherit',
    margin: 0,
    minWidth: 0,
    // The container dims as a whole when the field is disabled.
    opacity: 1,
    outline: 'none',
    outlineOffset: 0,
    paddingBlock: 0,
    transitionDuration: duration.fast,
    transitionProperty: 'color',
    width: '100%',
    '::placeholder': { color: colors.foregroundNeutralFaded }
  },
  countryTrigger: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: radius.none,
    borderStyle: 'none',
    borderWidth: 0,
    boxSizing: 'border-box',
    caretColor: 'transparent',
    color: colors.foregroundNeutral,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'flex',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    gap: unit.x1,
    height: '100%',
    justifyContent: 'center',
    lineHeight: 'inherit',
    margin: 0,
    minWidth: 0,
    opacity: 1,
    outline: 'none',
    outlineOffset: 0,
    paddingBlock: 0,
    paddingInline: unit.x3,
    position: 'relative',
    userSelect: 'none',
    '::after': {
      backgroundColor: colors.borderNeutralFaded,
      content: '""',
      height: unit.x5,
      position: 'absolute',
      right: 0,
      width: stroke.ring1
    }
  },
  flag: {
    alignItems: 'center',
    borderRadius: radius.small,
    display: 'flex',
    height: unit.x4,
    justifyContent: 'center',
    overflow: 'hidden',
    width: unit.x5
  },
  flagFallback: {
    height: unit.x4,
    opacity: 0.6,
    width: unit.x4
  },
  countryLabel: {
    flex: 1
  },
  countryCode: {
    color: colors.foregroundNeutralFaded
  },
  popup: {
    minWidth: container.xxsmall,
    width: 'var(--anchor-width)'
  },
  searchWrap: {
    alignItems: 'center',
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1,
    boxSizing: 'border-box',
    display: 'flex',
    gap: unit.x2,
    paddingBlock: unit.x1_5,
    paddingInline: unit.x3,
    position: 'relative',
    width: '100%'
  },
  searchIcon: {
    color: colors.foregroundNeutralFaded,
    flexShrink: 0,
    height: unit.x4,
    width: unit.x4
  },
  countrySearchWrap: {
    flex: 1,
    minWidth: 0,
    width: '100%'
  },
  countrySearchInput: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: radius.none,
    borderStyle: 'none',
    borderWidth: 0,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    height: unit.x8,
    opacity: 1,
    outline: {
      default: 'none',
      ':focus': 'none',
      ':focus-visible': 'none'
    },
    outlineOffset: 0,
    paddingInline: 0,
    width: '100%',
    '::placeholder': { color: colors.foregroundNeutralFaded }
  }
})
