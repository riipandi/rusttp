import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const tabsStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    gap: unit.x2
  },
  rootVertical: {
    flexDirection: 'row'
  },
  list: {
    alignItems: { default: 'center', '[data-orientation="vertical"]': 'stretch' },
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.medium,
    display: 'inline-flex',
    flexDirection: { default: 'row', '[data-orientation="vertical"]': 'column' },
    gap: unit.x1,
    height: { default: null, '[data-orientation="vertical"]': 'fit-content' },
    padding: unit.x1,
    width: 'fit-content'
  },
  listLine: {
    backgroundColor: 'transparent',
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1,
    borderRadius: radius.none,
    gap: 0,
    padding: 0
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      '[data-active]': colors.backgroundPage
    },
    borderRadius: radius.small,
    borderStyle: 'none',
    color: { default: colors.foregroundNeutralFaded, '[data-active]': colors.foregroundNeutral },
    display: 'inline-flex',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    justifyContent: 'center',
    lineHeight: fontLineHeight.body2,
    // A tab's ring sits inside its pill, which would clip an outside ring.
    outlineOffset: `calc(-1 * ${stroke.ring2})`,
    paddingInline: unit.x3,
    userSelect: 'none',
    whiteSpace: 'nowrap'
  },
  // Underline style: the active tab draws a bar over the list's bottom border.
  triggerLine: {
    backgroundColor: 'transparent',
    borderBottomColor: {
      default: 'transparent',
      '[data-active]': colors.backgroundPrimary
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring2,
    borderRadius: radius.none,
    marginBottom: `calc(-1 * ${stroke.ring1})`
  },
  content: {
    color: colors.foregroundNeutral,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    outline: 'none'
  }
})

// The list is as tall as a control of its size (`xs` 28, `sm` 32, `md` 36, `lg` 40). A
// pill list has 4px of padding around its tabs, so its tab is 8px shorter; an underline
// list has none, so its tab is the full height.
export const tabsSizes = stylex.create({
  xs: { fontSize: fontSize.caption1, height: unit.x5 },
  sm: { fontSize: fontSize.body2, height: unit.x6 },
  md: { fontSize: fontSize.body2, height: unit.x7 },
  lg: { fontSize: fontSize.body1, height: unit.x8 }
})

export const tabsLineSizes = stylex.create({
  xs: { fontSize: fontSize.caption1, height: unit.x7 },
  sm: { fontSize: fontSize.body2, height: unit.x8 },
  md: { fontSize: fontSize.body2, height: unit.x9 },
  lg: { fontSize: fontSize.body1, height: unit.x10 }
})
