import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, waitFor } from 'storybook/test'
import { colors } from '../styles/colors.stylex'
import { fontFamily, fontSize, fontWeight, unit } from '../styles/tokens.stylex'

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x3,
    maxWidth: '100%',
    width: '100%'
  },
  rootNarrow: { maxWidth: 360 },
  row: { alignItems: 'flex-start', display: 'flex', flexWrap: 'wrap', gap: unit.x3 },
  label: {
    color: colors.foregroundNeutralFaded,
    flexShrink: 0,
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    // The label column is as wide as the longest value, so the cells line up across rows.
    minWidth: '9ch',
    paddingBlock: unit.x2
  },
  cells: {
    alignItems: 'flex-start',
    display: 'flex',
    flex: '1 1 0',
    flexWrap: 'wrap',
    gap: unit.x3,
    minWidth: 0
  },
  cell: { display: 'flex', flexDirection: 'column', gap: unit.x1, minWidth: 0 },
  cellFill: { flex: '1 1 0' },
  cellWide: { flex: '1 1 12rem' },
  caption: {
    color: colors.foregroundNeutralFaded,
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption2
  }
})

interface AxisBase<Row extends string> {
  /** Name of the prop the rows show (`size`, `variant`, `color`, `state`): the cell carries it as `data-<axis>`. */
  axis: string
  rows: readonly Row[]
}

interface AxisOne<Row extends string> extends AxisBase<Row> {
  columns?: undefined
  /** Lets the cell use the full canvas width, for charts and other content that fills it. */
  wide?: boolean
  /** The control under test: it must be the cell's first element (a `play` measures `[data-<axis>]`'s first child). */
  children: (row: Row) => React.ReactNode
}

interface AxisCrossed<Row extends string, Column extends string> extends AxisBase<Row> {
  /** A second prop crossed with the first (`color` over `variant`); each cell also carries `data-<columnAxis>`. */
  columnAxis: string
  columns: readonly Column[]
  /** Cells share the row and grow to 12rem or more: for text-entry controls, which fill their cell. */
  fill?: boolean
  children: (row: Row, column: Column) => React.ReactNode
}

/**
 * One prop axis of a component, drawn as a labelled list: one row per value of `axis`, and with
 * `columns` one cell per value of a second axis. A story shows each prop in one place and a `play`
 * finds a cell by `[data-size="medium"]` or `[data-variant="outline"][data-color="critical"]`.
 * The grid wraps instead of overflowing, so a 390 px canvas shows every cell.
 */
export function Axis<Row extends string, Column extends string = never>(
  props: AxisOne<Row> | AxisCrossed<Row, Column>
) {
  const { axis, rows } = props
  return (
    <div
      {...stylex.props(
        styles.root,
        props.columns === undefined && !props.wide && styles.rootNarrow
      )}
    >
      {rows.map((row) => (
        <div key={row} {...stylex.props(styles.row)}>
          <span aria-hidden='true' {...stylex.props(styles.label)}>
            {row}
          </span>
          <div {...stylex.props(styles.cells)}>
            {props.columns === undefined ? (
              <div {...{ [`data-${axis}`]: row }} {...stylex.props(styles.cell, styles.cellFill)}>
                {props.children(row)}
              </div>
            ) : (
              props.columns.map((column) => (
                <div
                  key={column}
                  {...{ [`data-${axis}`]: row, [`data-${props.columnAxis}`]: column }}
                  {...stylex.props(styles.cell, props.fill && styles.cellWide)}
                >
                  {props.children(row, column)}
                  <span aria-hidden='true' {...stylex.props(styles.caption)}>
                    {column}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const stage = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x3,
    justifyContent: 'center',
    // Room on every side of the trigger row: a popup 14rem or less opens where it was asked to.
    minHeight: '20rem',
    paddingBlock: unit.x8,
    paddingInline: unit.x4,
    width: '100%'
  }
})

interface PlacementStageProps<Row extends string> {
  /** Name of the prop the cells show (`side`): each cell carries it as `data-<axis>`, as in `Axis`. */
  axis: string
  rows: readonly Row[]
  /** The trigger of one value; it must be the cell's first element. */
  children: (row: Row) => React.ReactNode
}

/**
 * The triggers of a position story (a tooltip, popover, or card side, a sheet edge), centred in a
 * stage that leaves room on every side. A popup flips when its side has no room, so a trigger in
 * a corner of the canvas never shows the position it names; in the middle it does. Use it on a
 * viewport that is wide enough for the popup (`desktop`), then prove the side with `expectPlacedOn`.
 * Cells carry `data-<axis>`, so `cellOf` finds them like an `Axis` cell.
 */
export function PlacementStage<Row extends string>({
  axis,
  rows,
  children
}: PlacementStageProps<Row>) {
  return (
    <div {...stylex.props(stage.root)}>
      {rows.map((row) => (
        <div key={row} {...{ [`data-${axis}`]: row }}>
          {children(row)}
        </div>
      ))}
    </div>
  )
}

export type Side = 'top' | 'right' | 'bottom' | 'left'

/**
 * The popup sits on `side` of its trigger and clear of it: its near edge is not past the trigger's
 * near edge. Measured from the boxes, so a popup that flipped (or a data attribute that lies) fails.
 */
export async function expectPlacedOn(popup: HTMLElement, trigger: HTMLElement, side: Side) {
  await waitFor(() => {
    const p = popup.getBoundingClientRect()
    const t = trigger.getBoundingClientRect()
    const clear = {
      top: p.bottom <= t.top + 1,
      bottom: p.top >= t.bottom - 1,
      left: p.right <= t.left + 1,
      right: p.left >= t.right - 1
    }
    return expect(clear[side], `the popup is not on the ${side} of its trigger`).toBe(true)
  })
}
