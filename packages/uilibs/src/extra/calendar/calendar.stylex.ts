import * as stylex from '@stylexjs/stylex'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { breakpoints, duration, radius, unit, stroke, zIndex } from '../../styles/tokens.stylex'
import { fontLineHeight, fontSize, fontWeight } from '../../styles/tokens.stylex'

export const calendarConsts = stylex.defineConsts({
  cellSize: '2rem'
})

export const calendarStyles = stylex.create({
  buttonNav: {
    height: calendarConsts.cellSize,
    padding: 0,
    userSelect: 'none',
    width: calendarConsts.cellSize
  },
  captionLabel: {
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    userSelect: 'none'
  },
  captionLabelDropdown: {
    alignItems: 'center',
    borderRadius: radius.medium,
    display: 'flex',
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x1,
    pointerEvents: 'none',
    userSelect: 'none'
  },
  chevron: {
    transform: { default: null, ':dir(rtl)': 'scaleX(-1)' },
    height: '1rem',
    width: '1rem'
  },
  day: {
    aspectRatio: '1 / 1',
    borderRadius: radius.medium,
    height: '100%',
    padding: 0,
    position: 'relative',
    textAlign: 'center',
    userSelect: 'none',
    width: '100%'
  },
  dayBtnBase: {
    alignItems: 'center',
    aspectRatio: '1 / 1',
    backgroundColor: {
      ':hover:not(:disabled)': colors.backgroundNeutralFaded,
      default: 'transparent'
    },
    borderColor: 'transparent',
    borderRadius: radius.medium,
    borderStyle: 'none',
    borderWidth: 0,
    color: {
      ':hover:not(:disabled)': colors.foregroundNeutral,
      default: colors.foregroundNeutral
    },
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'flex',
    flexDirection: 'column',
    fontSize: fontSize.body2,
    fontWeight: fontWeight.regular,
    gap: unit.x1,
    height: '100%',
    isolation: 'isolate',
    justifyContent: 'center',
    lineHeight: 1,
    minWidth: calendarConsts.cellSize,
    position: 'relative',
    // Hover and pick ease the fill in; under reduced motion it swaps at once.
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'background-color, color',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    width: '100%',
    zIndex: zIndex.raised
  },
  dayBtnFocused: {
    outline: `${stroke.ring2} solid ${colors.foregroundPrimary}`,
    outlineOffset: stroke.ring2,
    position: 'relative',
    zIndex: zIndex.raised
  },
  dayBtnRangeEnd: {
    backgroundColor: {
      ':hover': colors.backgroundPrimary,
      default: colors.backgroundPrimary
    },
    borderEndStartRadius: 0,
    borderStartStartRadius: 0,
    borderEndEndRadius: radius.medium,
    borderStartEndRadius: radius.medium,
    color: {
      ':hover': fixedColors.onBackgroundPrimary,
      default: fixedColors.onBackgroundPrimary
    }
  },
  dayBtnRangeMiddle: {
    backgroundColor: {
      ':hover': colors.backgroundNeutralFaded,
      default: colors.backgroundNeutralFaded
    },
    borderRadius: 0,
    color: {
      ':hover': colors.foregroundNeutral,
      default: colors.foregroundNeutral
    }
  },
  dayBtnRangeStart: {
    backgroundColor: {
      ':hover': colors.backgroundPrimary,
      default: colors.backgroundPrimary
    },
    borderEndStartRadius: radius.medium,
    borderEndEndRadius: 0,
    borderStartStartRadius: radius.medium,
    borderStartEndRadius: 0,
    color: {
      ':hover': fixedColors.onBackgroundPrimary,
      default: fixedColors.onBackgroundPrimary
    }
  },
  dayBtnSelected: {
    backgroundColor: {
      ':hover': colors.backgroundPrimary,
      default: colors.backgroundPrimary
    },
    borderRadius: radius.medium,
    color: {
      ':hover': fixedColors.onBackgroundPrimary,
      default: fixedColors.onBackgroundPrimary
    }
  },
  disabled: {
    color: colors.foregroundDisabled
  },
  dropdownContent: {
    width: 'max-content'
  },
  dropdownTrigger: {
    backgroundColor: {
      ':focus-visible': colors.backgroundNeutralFaded,
      ':hover': colors.backgroundNeutralFaded,
      default: 'transparent'
    },
    borderStyle: 'none',
    borderWidth: 0,
    gap: unit.x1,
    height: calendarConsts.cellSize,
    minWidth: null,
    outlineOffset: stroke.ring2,
    paddingInline: unit.x1_5
  },
  dropdowns: {
    alignItems: 'center',
    display: 'flex',
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x1_5,
    height: calendarConsts.cellSize,
    justifyContent: 'center',
    position: 'relative',
    width: 'fit-content',
    zIndex: zIndex.raised
  },
  hidden: {
    visibility: 'hidden'
  },
  month: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x3,
    width: '100%'
  },
  monthCaption: {
    alignItems: 'center',
    display: 'flex',
    height: calendarConsts.cellSize,
    justifyContent: 'center',
    paddingInline: 0,
    width: '100%'
  },
  monthGrid: {
    borderCollapse: 'collapse',
    width: '100%'
  },
  months: {
    display: 'flex',
    flexDirection: {
      [breakpoints.medium]: 'row',
      default: 'column'
    },
    gap: {
      [breakpoints.large]: unit.x6,
      default: unit.x4
    },
    position: 'relative'
  },
  nav: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x1,
    insetInline: 0,
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: zIndex.base
  },
  outside: {
    color: colors.foregroundNeutralFaded
  },
  rangeEnd: {
    '::after': {
      backgroundColor: colors.backgroundNeutralFaded,
      bottom: 0,
      content: '""',
      insetInlineStart: 0,
      position: 'absolute',
      top: 0,
      width: '1rem'
    },
    backgroundColor: colors.backgroundNeutralFaded,
    borderEndEndRadius: radius.medium,
    borderStartEndRadius: radius.medium,
    isolation: 'isolate',
    position: 'relative',
    zIndex: zIndex.base
  },
  rangeMiddle: {
    borderRadius: 0
  },
  rangeStart: {
    '::after': {
      backgroundColor: colors.backgroundNeutralFaded,
      bottom: 0,
      content: '""',
      position: 'absolute',
      insetInlineEnd: 0,
      top: 0,
      width: '1rem'
    },
    backgroundColor: colors.backgroundNeutralFaded,
    borderEndStartRadius: radius.medium,
    borderStartStartRadius: radius.medium,
    isolation: 'isolate',
    position: 'relative',
    zIndex: zIndex.base
  },
  root: {
    backgroundColor: colors.backgroundElevationBase,
    borderRadius: radius.large,
    maxWidth: '100%',
    padding: unit.x2,
    position: 'relative',
    width: 'fit-content'
  },
  today: {
    backgroundColor: colors.backgroundNeutralFaded,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral
  },
  week: {
    display: 'flex',
    marginTop: unit.x2,
    width: '100%'
  },
  weekNumber: {
    color: colors.foregroundNeutralFaded,
    // A `<th>` is bold by default.
    fontSize: fontSize.caption1,
    fontWeight: 'normal',
    lineHeight: fontLineHeight.caption1,
    userSelect: 'none'
  },
  weekNumberCell: {
    alignItems: 'center',
    display: 'flex',
    height: calendarConsts.cellSize,
    justifyContent: 'center',
    textAlign: 'center',
    width: calendarConsts.cellSize
  },
  weekNumberHeader: {
    userSelect: 'none',
    width: calendarConsts.cellSize
  },
  weekday: {
    alignItems: 'center',
    borderRadius: radius.medium,
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    flex: 1,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    height: calendarConsts.cellSize,
    justifyContent: 'center',
    lineHeight: fontLineHeight.caption1,
    textAlign: 'center',
    userSelect: 'none'
  },
  weekdays: {
    display: 'flex'
  }
})
