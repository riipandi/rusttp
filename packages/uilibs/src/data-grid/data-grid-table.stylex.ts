import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from '../styles/colors.stylex'
import {
  breakpoints,
  container,
  duration,
  fontFamily,
  fontSize,
  fontLineHeight,
  fontWeight,
  radius,
  stroke,
  unit
} from '../styles/tokens.stylex'
import { gridLayer } from './data-grid.stylex'

/**
 * What a pinnable cell takes from its column, as `getPinningStyles` computes it; `null` leaves the
 * property to the cell's other styles.
 */
export interface DataGridPinningStyle {
  insetInlineStart: string | null
  insetInlineEnd: string | null
  position: 'sticky' | null
  transform: string | null
  contain: string | null
  width: number
  zIndex: number | null
  backgroundClip: string | null
}

/**
 * The data-grid table renderer chrome. State-driven styles are applied as
 * conditional stylex.props arguments computed in React. Geometry that is only known at run time
 * (column widths, pin offsets, tree indent) is a dynamic style in the SAME `stylex.props` call as
 * the element's other styles: a raw `style` beside it would be replaced by the `style` that
 * `stylex.props` returns for a dynamic style (the drag styles are one), and with it the geometry.
 * A column width is `calc(var(--col-X-size) * 1px)`, so a resize drag still moves it without a
 * React render.
 *
 * Row separators are painted on the tds (border-separate). Whether a row
 * paints a bottom border depends on the ROW's position, so the row sets the
 * `--dg-row-border-b` custom property and the tds consume it.
 */
export const dataGridTableStyles = stylex.create({
  table: {
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.regular,
    lineHeight: fontLineHeight.body2,
    textAlign: 'start',
    verticalAlign: 'middle'
  },
  // Draggable columns need collapse for the dnd transform model; the
  // default is border-separate with zero spacing (row borders paint on tds).
  // A cell-selection grid holds DOM focus itself. While no cell is active (the first Tab, or after
  // Escape clears the selection) it draws the library ring, inside the table so a scroll area does
  // not clip it; once a cell is active (`aria-activedescendant`, set by `data-grid-cell.tsx`) the
  // cell's own edge is the indicator and the table draws nothing, so the two never double.
  gridFocusable: {
    outline: {
      default: 'none',
      ':focus-visible:not([aria-activedescendant])': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: {
      default: 0,
      ':focus-visible:not([aria-activedescendant])': `calc(-1 * ${stroke.ring2})`
    }
  },
  tableSeparate: {
    borderCollapse: 'separate',
    borderSpacing: 0
  },
  tableSized: {
    minWidth: 0
  },
  tableFull: {
    width: '100%',
    minWidth: '100%'
  },
  tableFixed: {
    tableLayout: 'fixed'
  },
  tableAuto: {
    tableLayout: 'auto'
  },
  // Source headerSticky default slot: sticky top-0 z-40 bg-background/90
  // backdrop-blur-xs. z-40 keeps it above pinned body cells (zIndex 30).
  headerSticky: {
    backdropFilter: `blur(${unit.x0_5})`,
    backgroundColor: `color-mix(in srgb, ${colors.backgroundPage} 90%, transparent)`,
    position: 'sticky',
    top: 0,
    zIndex: gridLayer.header
  },
  // The row's separator: its cells paint `borderBottomWidth` from this custom property.
  rowBorder: { '--dg-row-border-b': '1px' },
  rowNoBorder: { '--dg-row-border-b': '0px' },
  // A column's width, as a length or a number of px.
  colWidth: (width: number | string) => ({ width }),
  // The geometry of a pinned cell. Listed last, after the drag style: it replaces what used to be
  // an inline style, which beat every class.
  pinning: (pin: DataGridPinningStyle) => ({
    backgroundClip: pin.backgroundClip,
    contain: pin.contain,
    insetInlineEnd: pin.insetInlineEnd,
    insetInlineStart: pin.insetInlineStart,
    position: pin.position,
    transform: pin.transform,
    width: pin.width,
    zIndex: pin.zIndex
  }),
  // A pinned header cell also sticks to the top of a sticky header.
  thPinnedStickyTop: { top: 0 },
  // Header cell.
  th: {
    color: colors.foregroundNeutral,
    fontWeight: fontWeight.medium,
    height: unit.x10,
    paddingInline: {
      default: unit.x3,
      '[data-dense]': unit.x2
    },
    position: 'relative',
    textAlign: 'start',
    verticalAlign: 'middle'
  },
  thHeaderBackground: {
    backgroundColor: colors.backgroundNeutral
  },
  // headerBorder: the bottom border lives on the th (border-separate).
  thHeaderBorder: {
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomStyle: 'solid',
    borderBottomWidth: stroke.ring1
  },
  // cellBorder: end separators on every cell except the row's last child
  // (the resize filler strip or the true last cell) — `*:last:border-e-0`.
  cellBorder: {
    borderInlineEndColor: colors.borderNeutralFaded,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: {
      default: stroke.ring1,
      ':last-child': 0
    }
  },
  // Cell-border suppression on the last CENTER cell when the resize filler
  // follows it (that cell is not :last-child there, so the conditional above
  // cannot apply).
  cellBorderLast: {
    borderInlineEndWidth: 0
  },
  thPinned: {
    backgroundColor: colors.backgroundNeutral,
    isolation: 'isolate'
  },
  thResizable: {
    overflow: {
      default: 'visible',
      '[data-pinned]': 'hidden'
    }
  },
  thResizableLast: {
    paddingInlineEnd: unit.x8
  },
  // Pinned-cell boundary shadows (inset divider toward the scrollable side).
  thPinnedDividerStart: {
    boxShadow: {
      default: `inset -1px 0 0 0 ${colors.borderNeutralFaded}`,
      ':dir(rtl)': `inset 1px 0 0 0 ${colors.borderNeutralFaded}`
    }
  },
  thPinnedDividerEnd: {
    boxShadow: {
      default: `inset 1px 0 0 0 ${colors.borderNeutralFaded}`,
      ':dir(rtl)': `inset -1px 0 0 0 ${colors.borderNeutralFaded}`
    }
  },
  // Body cell.
  td: {
    paddingBlock: {
      default: unit.x2,
      '[data-dense]': unit.x1_5
    },
    paddingInline: {
      default: unit.x3,
      '[data-dense]': unit.x2
    },
    textAlign: 'start',
    verticalAlign: 'middle',
    // Row separator, driven by the row's own --dg-row-border-b var. Every
    // cell of a bordered row carries it (the row-level logic decides which
    // ROWS border, matching the source's `[&:not(:last-child)>td]:border-b` —
    // the :last-child there is a ROW, not a cell).
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomStyle: 'solid',
    borderBottomWidth: 'var(--dg-row-border-b, 0px)'
  },
  tdPinned: {
    backgroundColor: colors.backgroundPage,
    isolation: 'isolate'
  },
  tdPinnedDividerStart: {
    boxShadow: {
      default: `inset -1px 0 0 0 ${colors.borderNeutralFaded}`,
      ':dir(rtl)': `inset 1px 0 0 0 ${colors.borderNeutralFaded}`
    }
  },
  tdPinnedDividerEnd: {
    boxShadow: {
      default: `inset 1px 0 0 0 ${colors.borderNeutralFaded}`,
      ':dir(rtl)': `inset -1px 0 0 0 ${colors.borderNeutralFaded}`
    }
  },
  // Truncation when a column is resizable (td must not clip the selection
  // chrome, so with cell selection the truncation moves to the wrapper).
  tdTruncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  // The truncation wrapper used when cell selection is on: it consumes the
  // td padding with negative margins and restores it as its own, so its
  // overflow clips at exactly the boundary the td's truncate used to clip
  // at - including custom cells that pull into the padding the same way.
  truncateWrap: {
    marginBlockEnd: {
      default: `calc(-1 * ${unit.x2})`,
      '[data-dense]': `calc(-1 * ${unit.x1_5})`
    },
    marginBlockStart: {
      default: `calc(-1 * ${unit.x2})`,
      '[data-dense]': `calc(-1 * ${unit.x1_5})`
    },
    marginInlineEnd: {
      default: `calc(-1 * ${unit.x3})`,
      '[data-dense]': `calc(-1 * ${unit.x2})`
    },
    marginInlineStart: {
      default: `calc(-1 * ${unit.x3})`,
      '[data-dense]': `calc(-1 * ${unit.x2})`
    },
    overflow: 'hidden',
    paddingBlock: {
      default: unit.x2,
      '[data-dense]': unit.x1_5
    },
    paddingInline: {
      default: unit.x3,
      '[data-dense]': unit.x2
    },
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  // Body rows.
  row: {
    // hover:bg-muted/40 — pinned cells pre-mix their own hover tint below.
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${colors.backgroundNeutral} 40%, transparent)`
    }
  },
  rowHoverCursor: {
    cursor: 'pointer'
  },
  // A clickable row takes the library focus ring, drawn inside the row so a scroll area does not
  // clip it.
  rowFocusable: {
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': `calc(-1 * ${stroke.ring2})`
    }
  },
  rowSelected: {
    backgroundColor: `color-mix(in srgb, ${colors.backgroundNeutral} 50%, transparent)`
  },
  // Pinned cells are OPAQUE (they hide scrolled content), so a hover must
  // pre-mix the tint over the background instead of inheriting the
  // translucent row fill.
  pinnedCellHoverMix: {
    backgroundColor: `color-mix(in oklab, ${colors.backgroundNeutral} 40%, ${colors.backgroundPage})`
  },
  pinnedCellSelectedMix: {
    backgroundColor: `color-mix(in oklab, ${colors.backgroundNeutral} 50%, ${colors.backgroundPage})`
  },
  // Striped rows.
  rowStriped: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'transparent'
    }
  },
  cellStripedOdd: {
    backgroundColor: `color-mix(in srgb, ${colors.backgroundNeutral} 90%, transparent)`
  },
  cellStripedOddHover: {
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.backgroundNeutral} 90%, transparent)`,
      ':hover': `color-mix(in srgb, ${colors.backgroundNeutral} 100%, transparent)`
    }
  },
  // rowsPinnable tint.
  rowPinnedTint: {
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.backgroundNeutral} 30%, transparent)`,
      // hover:bg-muted/50
      ':hover': `color-mix(in srgb, ${colors.backgroundNeutral} 50%, transparent)`
    }
  },
  // Pinned-row boundary shadows: the separator shadow casts away from the
  // scrolled content.
  rowBoundaryTop: {
    boxShadow: `0 2px 0 ${colors.backgroundNeutralFaded}`
  },
  rowBoundaryBottom: {
    boxShadow: `0 -2px 0 ${colors.backgroundNeutralFaded}`
  },
  // CRUD row-status tints (defaults; yield to tableStyles overrides).
  rowStatusDeleted: {
    backgroundColor: `color-mix(in srgb, ${colors.backgroundCritical} 5%, transparent)`,
    opacity: 0.6
  },
  rowStatusDirty: {
    backgroundColor: colors.backgroundWarningFaded
  },
  rowStatusNew: {
    backgroundColor: colors.backgroundPositiveFaded
  },
  cellStatusDeleted: {
    backgroundColor: `color-mix(in oklab, ${colors.backgroundCritical} 5%, ${colors.backgroundPage})`,
    textDecoration: 'line-through'
  },
  cellStatusDirtyPinned: {
    backgroundColor: `color-mix(in oklab, ${colors.backgroundWarning} 5%, ${colors.backgroundPage})`
  },
  cellStatusNewPinned: {
    backgroundColor: `color-mix(in oklab, ${colors.backgroundPositive} 5%, ${colors.backgroundPage})`
  },
  // The classic edited-cell corner mark, active only when getCellStatus is
  // wired: amber (warning) for "dirty", destructive (critical) for "invalid".
  cellStatusMark: {
    position: 'relative',
    '::after': {
      borderInlineStartColor: 'transparent',
      borderInlineStartStyle: 'solid',
      borderInlineStartWidth: 5,
      borderTopColor: colors.backgroundCritical,
      borderTopStyle: 'solid',
      borderTopWidth: 5,
      blockSize: 0,
      content: '""',
      insetInlineEnd: 0,
      position: 'absolute',
      top: 0
    }
  },
  cellStatusMarkDirty: {
    '::after': {
      borderTopColor: colors.backgroundWarning
    }
  },
  // Filler cells for the resizable strip.
  fillCell: {
    padding: 0
  },
  fillHeadCellBackground: {
    backgroundColor: colors.backgroundNeutral
  },
  // Quick-create affordance row. The dense variants ride as separate styles
  // picked at the call site: stylex conditions produce a compiled shape the
  // consumer style slots (StyleXStyles) cannot accept.
  addRowButton: {
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
    // Block-level flex: inline-flex would sit on the cell's text baseline
    // and push the icon and label off vertical center.
    alignItems: 'center',
    borderRadius: 0,
    height: unit.x9,
    paddingInline: unit.x3
  },
  addRowButtonDense: {
    height: unit.x8,
    paddingInline: unit.x2
  },
  addRowCell: {
    padding: 0
  },
  addRowIcon: {
    height: unit.x4,
    width: unit.x4
  },
  // Empty state.
  emptyCell: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    paddingBlock: unit.x6,
    textAlign: 'center'
  },
  // Spinner loading mode cell.
  loadingCell: {
    padding: unit.x8
  },
  loadingInner: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  loadingText: {
    color: colors.foregroundNeutralFaded
  },
  // Floating loader (spinner mode for viewports).
  loaderWrap: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  },
  loaderCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevationBase,
    borderStyle: 'solid',
    borderTopColor: colors.borderNeutralFaded,
    borderTopWidth: stroke.ring1,
    borderInlineEndColor: colors.borderNeutralFaded,
    borderInlineEndWidth: stroke.ring1,
    borderInlineStartColor: colors.borderNeutralFaded,
    borderInlineStartWidth: stroke.ring1,
    borderBottomColor: colors.borderNeutralFaded,
    borderBottomWidth: stroke.ring1,
    borderRadius: radius.large,
    color: colors.foregroundNeutralFaded,
    display: 'flex',
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium,
    gap: unit.x2,
    lineHeight: 1,
    paddingBlock: unit.x2,
    paddingInline: unit.x4
  },
  loaderSpinner: {
    height: unit.x5,
    opacity: 0.6,
    width: unit.x5
  },
  // Row pin toggle. Focus ring follows the standalone-control convention
  // (outside outline, stroke.ring2) like the base Button.
  rowPinButton: {
    alignItems: 'center',
    borderRadius: radius.medium,
    color: {
      default: `color-mix(in srgb, ${colors.foregroundNeutralFaded} 100%, transparent)`,
      ':hover': `color-mix(in srgb, ${colors.foregroundNeutral} 100%, transparent)`,
      '[data-pinned]': `color-mix(in srgb, ${colors.foregroundPrimary} 100%, transparent)`,
      ':hover[data-pinned]': `color-mix(in srgb, ${colors.foregroundPrimary} 80%, transparent)`
    },
    display: 'inline-flex',
    height: unit.x7,
    justifyContent: 'center',
    outlineOffset: stroke.ring2,
    transitionDuration: duration.fast,
    transitionProperty: 'color, background-color, border-color',
    width: unit.x7
  },
  // Row expand toggle.
  rowExpand: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    verticalAlign: 'middle'
  },
  // ps-(depth * step): a tree row's toggle is indented by its depth.
  treeIndent: (padding: number) => ({ paddingInlineStart: padding }),
  rowExpandButton: {
    alignItems: 'center',
    borderRadius: radius.medium,
    color: {
      default: `color-mix(in srgb, ${colors.foregroundNeutralFaded} 100%, transparent)`,
      ':hover': `color-mix(in srgb, ${colors.foregroundNeutral} 100%, transparent)`
    },
    display: 'inline-flex',
    height: {
      default: unit.x7,
      '[data-dense]': unit.x6
    },
    justifyContent: 'center',
    outlineOffset: stroke.ring2,
    transitionDuration: duration.fast,
    transitionProperty: 'color, background-color, border-color',
    width: {
      default: unit.x7,
      '[data-dense]': unit.x6
    }
  },
  rowExpandChevron: {
    height: unit.x4,
    transform: 'rotate(0deg)',
    transitionDuration: duration.medium,
    transitionProperty: {
      default: 'transform',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    width: unit.x4
  },
  rowExpandChevronCollapsed: {
    transform: {
      default: 'rotate(-90deg)',
      ':dir(rtl)': 'rotate(90deg)'
    }
  },
  rowExpandLeafSpacer: {
    flexShrink: 0,
    width: unit.x2
  },
  // Virtualization spacer tbody.
  bodySpacer: {
    height: unit.x2
  },
  // Column resize handle.
  resizeHandle: {
    cursor: 'col-resize',
    display: 'flex',
    height: '100%',
    position: 'absolute',
    top: 0,
    touchAction: 'none',
    userSelect: 'none',
    zIndex: gridLayer.raised
  },
  // The keyboard focus ring of the separator, drawn inside its box so no ancestor clips it.
  resizeHandleFocusable: {
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': `calc(-1 * ${stroke.ring2})`
    }
  },
  resizeHandleStart: {
    justifyContent: 'flex-start',
    insetInlineStart: 0,
    width: unit.x5
  },
  resizeHandleEnd: {
    justifyContent: 'flex-end',
    insetInlineEnd: 0,
    width: unit.x5
  },
  resizeHandleCenter: {
    justifyContent: 'center',
    insetInlineEnd: `calc(-1 * ${unit.x2})`,
    width: unit.x5
  },
  // The hairline preview line; hidden where another separator already draws
  // the boundary (cell borders, the pin affordance's own divider).
  resizeHandleLine: {
    '::before': {
      backgroundColor: colors.borderNeutralFaded,
      blockSize: '100%',
      content: '""',
      inlineSize: stroke.ring1,
      position: 'absolute',
      top: 0
    }
  },
  resizeHandleLineStart: {
    '::before': {
      insetInlineStart: 0
    }
  },
  resizeHandleLineEnd: {
    '::before': {
      insetInlineEnd: 1
    }
  },
  resizeHandleLineCenter: {
    '::before': {
      insetInline: 0,
      marginInline: 'auto'
    }
  },
  resizeHandleLineHidden: {
    '::before': {
      display: 'none'
    }
  },
  resizeHandleActive: {
    opacity: 1
  },
  resizeHandleActiveLine: {
    '::before': {
      backgroundColor: colors.foregroundPrimary,
      display: 'block',
      inlineSize: stroke.ring2
    }
  },
  resizeHandleActiveLineEnd: {
    '::before': {
      insetInlineEnd: 0
    }
  },
  // Live (onChange) resize indicator.
  resizeIndicator: {
    insetBlock: 0,
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: gridLayer.overlay
  },
  resizeIndicatorBar: {
    backgroundColor: `color-mix(in srgb, ${colors.foregroundPrimary} 85%, transparent)`,
    insetBlock: 0,
    left: 0,
    position: 'absolute',
    transform: 'translateX(-50%)',
    width: stroke.ring1
  },
  resizeIndicatorHead: {
    backgroundColor: colors.foregroundPrimary,
    borderEndEndRadius: radius.small,
    borderEndStartRadius: radius.small,
    boxShadow: shadow.outline,
    left: 0,
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    width: `calc(${unit.x1} + ${stroke.ring1})`
  },
  // Body / foot sections.
  footRowBackground: {
    backgroundColor: `color-mix(in srgb, ${colors.backgroundNeutral} 40%, transparent)`
  },
  footCell: {
    color: `color-mix(in srgb, ${colors.foregroundNeutral} 80%, transparent)`,
    fontWeight: fontWeight.medium,
    paddingBlock: {
      default: unit.x2,
      '[data-dense]': unit.x1_5
    },
    paddingInline: {
      default: unit.x3,
      '[data-dense]': unit.x2
    },
    verticalAlign: 'middle'
  },
  // Fill handle variants.
  fillHandle: {
    bottom: 0,
    cursor: 'crosshair',
    position: 'absolute',
    zIndex: gridLayer.raised
  },
  fillHandleDot: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.backgroundPage,
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    blockSize: 9,
    inlineSize: 9,
    insetInlineEnd: 0
  },
  fillHandleSquare: {
    backgroundColor: colors.backgroundPrimary,
    blockSize: 5,
    inlineSize: 5,
    insetInlineEnd: 0
  },
  fillHandleRing: {
    backgroundColor: colors.backgroundPage,
    borderColor: colors.foregroundPrimary,
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: 2,
    blockSize: 11,
    inlineSize: 11,
    insetInlineEnd: -5,
    bottom: -5
  },
  fillHandleRingClampEnd: {
    insetInlineEnd: 0
  },
  fillHandleRingClampBottom: {
    bottom: 0
  }
})

/** Viewport wrapper for the table (single or split header/body layouts). */
export const dataGridTableViewportStyles = stylex.create({
  viewport: {
    minWidth: '100%',
    position: 'relative',
    verticalAlign: 'top'
  }
})

/**
 * Draggable-columns chrome. Drag geometry (transform/transition/opacity) is
 * applied through dynamic styles; the grip button and its hairline spacing
 * are static.
 */
export const dataGridTableDndStyles = stylex.create({
  headerControls: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x0_5,
    justifyContent: 'flex-start'
  },
  grip: {
    display: 'inline-flex',
    height: unit.x4,
    marginInlineStart: `calc(-1 * ${unit.x2})`,
    opacity: {
      default: 0.6,
      ':hover': 1
    },
    width: unit.x4
  },
  gripButton: (isDragging: boolean) => ({
    cursor: isDragging ? 'grabbing' : 'grab',
    height: unit.x6,
    marginInlineStart: `calc(-1 * ${unit.x2})`,
    width: unit.x6
  }),
  headerLabel: {
    flexGrow: 1
  },
  // Dynamic drag geometry for the sortable th/td.
  sortableCell: (style: {
    opacity: number
    transform: string | null
    transition: string | null
    isDragging: boolean
  }) => ({
    cursor: style.isDragging ? 'grabbing' : null,
    opacity: style.opacity,
    position: 'relative',
    transform: style.transform,
    // dnd-kit hands over a full `transition` shorthand ("transform 200ms ease"), which is not a
    // valid `transition-property`.
    transition: style.transition,
    zIndex: style.isDragging ? 1 : 0
  }),
  viewportDragging: {
    cursor: 'grabbing'
  }
})

/**
 * Applies the dnd-kit drag state to a sortable th/td. `width` stays on the
 * element's inline style (it rides the CSS-variable resize system).
 */
export function dndCellDragStyle(
  isDragging: boolean,
  transform: string | undefined,
  transition: string | undefined
) {
  return dataGridTableDndStyles.sortableCell({
    opacity: isDragging ? 0.8 : 1,
    transform: transform ?? null,
    transition: transition ?? null,
    isDragging
  })
}

export const dndGripCursorStyles = {
  dragging: dataGridTableDndStyles.gripButton(true),
  idle: dataGridTableDndStyles.gripButton(false)
}

/** Draggable-rows chrome. */
export const dataGridTableDndRowsStyles = stylex.create({
  // The grip button: 28px, grab cursor, muted at rest.
  gripButton: {
    blockSize: unit.x7,
    cursor: 'grab',
    inlineSize: unit.x7,
    opacity: {
      default: 0.7,
      ':hover': 1,
      ':active': 1
    }
  },
  gripButtonActive: {
    cursor: 'grabbing'
  },
  gripDisabled: {
    cursor: 'not-allowed'
  },
  gripIcon: {
    blockSize: unit.x4,
    inlineSize: unit.x4
  },
  // Decoration / drop-indicator wrappers ride the ROW as the nearest
  // positioned ancestor, spanning the full width without adding a column.
  rowDecoration: {
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute'
  },
  dropIndicator: {
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: gridLayer.scrollbar
  },
  // Two solid pixels down the leading edge — the bar is the whole indicator.
  dropIndicatorBar: {
    backgroundColor: colors.backgroundPrimary,
    insetBlock: 0,
    insetInlineStart: 0,
    position: 'absolute',
    width: stroke.ring2
  },
  // DragOverlay clone.
  overlayTable: {
    backgroundColor: colors.backgroundPage,
    borderColor: colors.borderNeutralFaded,
    borderStyle: 'solid',
    borderWidth: stroke.ring1,
    borderRadius: radius.medium,
    boxShadow: shadow.raised,
    cursor: 'grabbing',
    pointerEvents: 'none'
  },
  overlayCell: {
    padding: 0,
    verticalAlign: 'middle'
  },
  // The clone has no row or table of its own to size it: the measured widths and the height of
  // the source, in px (a zero height leaves the row to its content).
  overlayTableSize: (width: number) => ({ tableLayout: 'fixed', width }),
  overlayRowHeight: (height: number | null) => ({ height }),
  overlayCellWidth: (width: number) => ({ width }),
  overlayCellInner: {
    overflow: 'hidden',
    paddingInline: unit.x3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  // Dynamic drag state for the sortable tr.
  rowDrag: (state: { isDragging: boolean; transform: string | null }) => ({
    cursor: state.isDragging ? 'grabbing' : null,
    opacity: state.isDragging ? 0.4 : null,
    // Inset so the dashes sit inside the row box and cannot be clipped by
    // the neighbouring row's border.
    outlineColor: state.isDragging ? colors.borderNeutralFaded : null,
    outlineOffset: state.isDragging ? -1 : null,
    outlineStyle: state.isDragging ? 'dashed' : null,
    outlineWidth: state.isDragging ? 1 : null,
    position: 'relative',
    transform: state.transform,
    zIndex: state.isDragging ? 1 : 0
  })
})

/**
 * Row drag state for the sortable tr: transform from dnd-kit, and the
 * held-row treatment (dimmed, dashed inset outline) so the slot left behind
 * reads as the space being moved out of. dnd-kit's own transition is dropped:
 * a transform transition on a `tr` stops the transform applying at all in
 * Chrome, and displacement must land in one step anyway.
 */
export function dndRowDragStyle(isDragging: boolean, transform: string | undefined) {
  return dataGridTableDndRowsStyles.rowDrag({
    isDragging,
    transform: transform ?? null
  })
}

/**
 * Pagination chrome. Tailwind `sm:` (640px) aligns to the project's first
 * token breakpoint (660px).
 */
export const dataGridPaginationStyles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: { default: 'column', [breakpoints.medium]: 'row' },
    flexGrow: 1,
    flexWrap: 'wrap',
    gap: unit.x2,
    justifyContent: 'space-between',
    paddingBlock: { default: unit.x2, [breakpoints.medium]: 0 }
  },
  sizes: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x2,
    order: { default: 2, [breakpoints.medium]: 1 },
    paddingBlockEnd: { default: unit.x2, [breakpoints.medium]: 0 }
  },
  mutedText: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2
  },
  // w-fit with a min, never a fixed width: a fixed w-16 clipped the value
  // "100" by 1px at nova's paddings, while fit-content grows the trigger for
  // 3-digit sizes and the min keeps the 1-2 digit ones from collapsing
  // narrower than 64px.
  pageSizeTrigger: {
    height: unit.x8,
    minWidth: unit.x16,
    width: 'fit-content'
  },
  pageSizeContent: { minWidth: 'var(--anchor-width)' },
  info: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: { default: 'column', [breakpoints.medium]: 'row' },
    gap: unit.x2,
    justifyContent: { default: 'center', [breakpoints.medium]: 'flex-end' },
    order: { default: 1, [breakpoints.medium]: 2 },
    paddingBlockStart: { default: unit.x2, [breakpoints.medium]: 0 }
  },
  infoText: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    order: { default: 2, [breakpoints.medium]: 1 },
    whiteSpace: 'nowrap'
  },
  pages: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x1,
    order: 1
  },
  pageButton: {
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    padding: 0
  },
  pageButtonMuted: { color: colors.foregroundNeutralFaded },
  pageButtonActive: {
    backgroundColor: colors.backgroundNeutralHighlightedFaded,
    color: colors.foregroundNeutral
  },
  arrowButton: {
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    padding: 0,
    transform: { default: null, ':dir(rtl)': 'rotate(180deg)' }
  },
  arrowIcon: { height: unit.x4, width: unit.x4 },
  sizesSkeleton: { height: unit.x8, width: container.xxsmall },
  infoSkeleton: { height: unit.x8, width: container.xsmall }
})

/** Virtual table chrome: placeholder cells, spacers, status rows. */
export const dataGridTableVirtualStyles = stylex.create({
  placeholderCell: {
    padding: 0
  },
  // Mirrors the table's cell border + pinned-cell chrome for placeholders.
  cellBorder: {
    borderInlineEndColor: colors.borderNeutralFaded,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: stroke.ring1
  },
  pinnedCell: {
    backgroundColor: colors.backgroundPage,
    isolation: 'isolate'
  },
  pinnedDividerStart: {
    boxShadow: {
      default: `inset -1px 0 0 0 ${colors.borderNeutralFaded}`,
      ':dir(rtl)': `inset 1px 0 0 0 ${colors.borderNeutralFaded}`
    }
  },
  pinnedDividerEnd: {
    boxShadow: {
      default: `inset 1px 0 0 0 ${colors.borderNeutralFaded}`,
      ':dir(rtl)': `inset -1px 0 0 0 ${colors.borderNeutralFaded}`
    }
  },
  utilityCenterCell: {
    padding: 0
  },
  statusCell: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2,
    lineHeight: fontLineHeight.body2,
    paddingBlock: unit.x4,
    textAlign: 'center'
  },
  statusCellCompact: {
    fontSize: fontSize.caption1,
    paddingBlock: unit.x3
  },
  statusInner: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'center'
  },
  spinner: {
    height: unit.x4,
    opacity: 0.6,
    width: unit.x4
  },
  viewportBlock: {
    display: 'block'
  }
})
