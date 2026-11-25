import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
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
