import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { StyleProp } from '../../styles/types'
import { focusRing, unitLength, type UnitStep } from '../../styles/utils.stylex'
import { tableAlign, tableCellSize, tableStyles as s, tableVerticalAlign } from './table.stylex'

export interface TableLabels {
  /** Name of the scrollable region around a wide table. Defaults to `Table`. */
  region: string
}

const defaultLabels: TableLabels = { region: 'Table' }

const ColumnBorderContext = React.createContext(false)

/** The props `TableHead` and `TableCell` share: alignment and size. */
interface CellProps {
  /** Horizontal alignment of the content; the cell's own default if unset (`left` in a head). */
  align?: keyof typeof tableAlign
  verticalAlign?: keyof typeof tableVerticalAlign
  /** A count of `unit` steps (`12` is 48px) or a CSS length (`'30%'`). */
  width?: UnitStep | (string & {})
  minWidth?: UnitStep | (string & {})
}

function cellStyles({ align, verticalAlign, width, minWidth }: CellProps, columnBorder: boolean) {
  return [
    align && tableAlign[align],
    verticalAlign && tableVerticalAlign[verticalAlign],
    width !== undefined && tableCellSize.width(unitLength(width)),
    minWidth !== undefined && tableCellSize.minWidth(unitLength(minWidth)),
    columnBorder && s.columnBorder
  ]
}

/**
 * The wrapper scrolls sideways when the table is wider than its column, so it is a focusable,
 * named region: a keyboard user can scroll it, and it is announced. Give the table a
 * `<caption>` or pass `labels.region` to say which table it is.
 */
export function Table({
  border = false,
  columnBorder = false,
  style,
  labels,
  ...props
}: Omit<React.ComponentProps<'table'>, 'className' | 'style' | 'border'> &
  StyleProp & {
    /** Draws an edge around the table, with rounded corners. */
    border?: boolean
    /** Draws an edge between the columns. */
    columnBorder?: boolean
    /** Name of the scroll region; English by default. */
    labels?: Partial<TableLabels>
  }) {
  const region = { ...defaultLabels, ...labels }.region
  return (
    <div
      role='region'
      aria-label={region}
      // A scrollable region must be focusable for keyboard users (axe: scrollable-region-focusable).
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...stylex.props(focusRing.root, s.container, border && s.bordered)}
    >
      <ColumnBorderContext.Provider value={columnBorder}>
        <table {...props} {...stylex.props(s.table, style)} />
      </ColumnBorderContext.Provider>
    </div>
  )
}

export function TableHeader({
  style,
  ...props
}: Omit<React.ComponentProps<'thead'>, 'className' | 'style'> & StyleProp) {
  return <thead {...props} {...stylex.props(style)} />
}

export function TableBody({
  style,
  ...props
}: Omit<React.ComponentProps<'tbody'>, 'className' | 'style'> & StyleProp) {
  return <tbody {...props} {...stylex.props(style)} />
}

export function TableFooter({
  style,
  ...props
}: Omit<React.ComponentProps<'tfoot'>, 'className' | 'style'> & StyleProp) {
  return <tfoot {...props} {...stylex.props(s.footer, style)} />
}

export function TableRow({
  highlighted = false,
  style,
  ...props
}: Omit<React.ComponentProps<'tr'>, 'className' | 'style'> &
  StyleProp & {
    /** Tints the row, such as for the selected one. Visual only: pair it with `aria-selected` where the table is selectable. */
    highlighted?: boolean
  }) {
  return <tr {...props} {...stylex.props(s.row, highlighted && s.highlighted, style)} />
}

export function TableHead({
  align,
  verticalAlign,
  width,
  minWidth,
  style,
  ...props
}: Omit<React.ComponentProps<'th'>, 'className' | 'style' | 'align' | 'width'> &
  StyleProp &
  CellProps) {
  const columnBorder = React.useContext(ColumnBorderContext)
  return (
    <th
      {...props}
      {...stylex.props(
        s.head,
        cellStyles({ align, verticalAlign, width, minWidth }, columnBorder),
        style
      )}
    />
  )
}

export function TableCell({
  align,
  verticalAlign,
  width,
  minWidth,
  style,
  ...props
}: Omit<React.ComponentProps<'td'>, 'className' | 'style' | 'align' | 'width'> &
  StyleProp &
  CellProps) {
  const columnBorder = React.useContext(ColumnBorderContext)
  return (
    <td
      {...props}
      {...stylex.props(
        s.cell,
        cellStyles({ align, verticalAlign, width, minWidth }, columnBorder),
        style
      )}
    />
  )
}

export function TableCaption({
  style,
  ...props
}: Omit<React.ComponentProps<'caption'>, 'className' | 'style'> & StyleProp) {
  return <caption {...props} {...stylex.props(s.caption, style)} />
}
