import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from '../../styles/colors.stylex'
import { easing, stroke, unit, zIndex } from '../../styles/tokens.stylex'
import { container, duration, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

// Raw `@media` strings below mirror the `viewport` values in `styles/tokens.stylex.ts` (medium 660, large 900,
// xlarge 1280): `breakpoints` is a set of closed ranges, and StyleX 0.19 only inlines media consts declared in the
// same file, so an open-ended query is written out.

/**
 * Styles for the Kanban primitive set (dnd-kit based).
 *
 * Mirrors `sortable.stylex.ts` for shared drag affordances (handles, drop
 * feedback, overlay) so both primitives feel identical.
 *
 * The `defaultMarker` lives ONLY on `KanbanColumn` (and its handle) so the
 * handle's `when.ancestor(':hover')` reveal fires per column — hovering
 * another column or the board gaps must not reveal handles.
 */
export const kanbanStyles = stylex.create({
  root: {
    touchAction: 'manipulation'
  },
  rootDragging: {
    cursor: 'grabbing',
    userSelect: 'none'
  },
  board: {
    display: 'grid',
    gap: unit.x4,
    // A track never shrinks below its column's `minWidth`: when the columns outgrow the board it
    // scrolls sideways instead of letting a column spill over the next. The padding keeps the
    // columns' focus ring and outline inside the scroll box, which would clip them.
    gridAutoColumns: {
      default: `minmax(${container.small}, 1fr)`,
      '@media (max-width: 659px)': 'minmax(0, 1fr)'
    },
    gridAutoFlow: { default: 'column', '@media (max-width: 659px)': 'row' },
    gridTemplateColumns: { default: null, '@media (max-width: 659px)': '1fr' },
    overflowX: 'auto',
    padding: unit.x1
  },
  column: {
    backgroundColor: colors.backgroundElevationBase,
    borderColor: colors.borderNeutralFaded,
    borderRadius: radius.large,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    boxShadow: shadow.outline,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    gap: unit.x2,
    lineHeight: fontLineHeight.body2,
    maxWidth: { default: container.xxlarge, '@media (max-width: 659px)': '100%' },
    minWidth: { default: container.small, '@media (max-width: 659px)': 0 },
    outlineOffset: stroke.ring2,
    paddingBlock: { default: unit.x3, '@media (max-width: 659px)': unit.x2 },
    paddingInline: { default: unit.x3, '@media (max-width: 659px)': unit.x2 },
    touchAction: 'manipulation',
    transitionDuration: {
      default: duration.medium,
      '@media (prefers-reduced-motion: reduce)': '0ms'
    },
    transitionProperty: 'background-color, border-color, box-shadow, transform, opacity',
    transitionTimingFunction: easing.decelerate
  },
  columnDragging: {
    opacity: 0.5,
    zIndex: zIndex.absolute
  },
  columnOver: {
    backgroundColor: 'transparent',
    borderColor: 'transparent'
  },
  columnDisabled: {
    opacity: 0.5
  },
  columnHandle: {
    alignItems: 'center',
    borderRadius: radius.small,
    color: {
      default: colors.foregroundNeutral,
      ':hover': colors.foregroundPrimary,
      ':active': colors.foregroundPrimary
    },
    cursor: {
      default: 'grab',
      ':active': 'grabbing'
    },
    display: 'flex',
    flexShrink: 0,
    height: { default: unit.x6, '@media (max-width: 659px)': unit.x7 },
    justifyContent: 'center',
    padding: unit.x1,
    touchAction: 'none',
    transitionDuration: {
      default: duration.medium,
      '@media (prefers-reduced-motion: reduce)': '0ms'
    },
    transitionProperty: 'color, opacity',
    transitionTimingFunction: easing.decelerate,
    width: { default: unit.x6, '@media (max-width: 659px)': unit.x7 }
  },
  columnHandleVisible: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover')]: 1,
      ':hover': 1,
      ':focus-visible': 1,
      ':active': 1,
      '@media (pointer: coarse)': 1
    }
  },
  columnHandleGrab: {
    cursor: 'grab'
  },
  columnHandleDragging: {
    color: colors.foregroundPrimary,
    cursor: 'grabbing',
    opacity: 1
  },
  columnHandleHiddenDuringDrag: {
    opacity: 0
  },
  columnHandleDisabled: {
    color: colors.foregroundDisabled,
    cursor: 'not-allowed',
    opacity: 0.5
  },
  columnContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: { default: unit.x2, '@media (max-width: 659px)': unit.x1 },
    minHeight: unit.x12,
    overflowY: 'auto'
  },
  columnContentEmpty: {
    minHeight: 0
  },
  item: {
    backgroundColor: {
      default: colors.backgroundPage,
      ':hover': colors.backgroundNeutralHighlightedFaded,
      ':active': colors.backgroundNeutralFaded
    },
    borderColor: { default: colors.borderNeutralFaded, ':hover': colors.borderNeutral },
    boxShadow: { default: null, ':hover': shadow.outline },
    borderRadius: radius.medium,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    outlineOffset: stroke.ring2,
    paddingBlock: { default: unit.x3, '@media (max-width: 659px)': unit.x2 },
    paddingInline: { default: unit.x3, '@media (max-width: 659px)': unit.x2 },
    touchAction: 'manipulation',
    transitionDuration: {
      default: duration.medium,
      '@media (prefers-reduced-motion: reduce)': '0ms'
    },
    transitionProperty: 'background-color, border-color, box-shadow, transform, opacity',
    transitionTimingFunction: easing.decelerate
  },
  itemDragging: {
    opacity: 0.5,
    zIndex: zIndex.absolute
  },
  itemOver: {
    backgroundColor: 'transparent',
    borderColor: 'transparent'
  },
  itemDisabled: {
    opacity: 0.5
  },
  overlayContent: {
    cursor: 'grabbing',
    opacity: 0.85,
    pointerEvents: 'none'
  }
})
