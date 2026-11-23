import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke } from '../../styles/tokens.stylex'
import { radius, unit } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'
import { duration } from '../../styles/tokens.stylex'

export const tableStyles = stylex.create({
  container: {
    outlineOffset: `calc(-1 * ${stroke.ring2})`,
    overflowX: 'auto',
    position: 'relative',
    width: '100%'
  },
  table: {
    borderCollapse: 'collapse',
    captionSide: 'bottom',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    width: '100%'
  },
  row: {
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${colors.backgroundNeutral} 50%, transparent)`
    },
    // The header row keeps its bottom border; the last body row's border is
    // dropped on the last row.
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomStyle: { default: 'solid', ':last-child': 'none' },
    borderBottomWidth: { default: stroke.ring1, ':last-child': 0 },
    transitionDuration: duration.fast,
    transitionProperty: 'background-color'
  },
  head: {
    // The header row is the :last-child of its <thead>, so the row-level
    // border removal would strip it — draw the header border on the cells
    // instead (border-collapse merges them into one line).
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1,
    color: colors.foregroundNeutral,
    fontWeight: fontWeight.medium,
    height: unit.x10,
    paddingInline: unit.x2,
    textAlign: 'left',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap'
  },
  cell: {
    padding: unit.x2,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap'
  },
  footer: {
    backgroundColor: `color-mix(in srgb, ${colors.backgroundNeutral} 50%, transparent)`,
    borderTopColor: colors.borderNeutralFaded,
    borderTopStyle: 'solid',
    borderTopWidth: stroke.ring1,
    fontWeight: fontWeight.medium
  },
  // `border` draws an edge around the table and rounds it; the region clips the rows to the corners.
  bordered: {
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.large,
    borderStyle: 'solid',
    borderWidth: stroke.ring1
  },
  // `columnBorder` draws an edge between columns: every cell but the last in its row.
  columnBorder: {
    borderInlineEndColor: colors.borderNeutralFaded,
    borderInlineEndStyle: { default: 'none', ':not(:last-child)': 'solid' },
    borderInlineEndWidth: { default: 0, ':not(:last-child)': stroke.ring1 }
  },
  // A selected or current row: the neutral tint held, so hover does not change it.
  highlighted: { backgroundColor: colors.backgroundNeutral },
  caption: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    marginTop: unit.x4
  }
})

// `align` and `verticalAlign` take the CSS keywords of Reshaped's `start | center | end`.
export const tableAlign = stylex.create({
  start: { textAlign: 'start' },
  center: { textAlign: 'center' },
  end: { textAlign: 'end' }
})

export const tableVerticalAlign = stylex.create({
  start: { verticalAlign: 'top' },
  center: { verticalAlign: 'middle' },
  end: { verticalAlign: 'bottom' }
})

// A cell size is a CSS length or a count of `unit` steps, known only at run time: a dynamic style.
export const tableCellSize = stylex.create({
  width: (value: string) => ({ width: value }),
  minWidth: (value: string) => ({ minWidth: value })
})
