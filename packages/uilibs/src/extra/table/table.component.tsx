import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { type } from '../../styles/type.stylex'
import type { StyleProp } from '../../styles/types'
import { focusRing, unitLength, type UnitStep } from '../../styles/utils.stylex'
import { tableAlign, tableCellSize, tableStyles as s, tableVerticalAlign } from './table.stylex'

export interface TableLabels {
  /** Name of the scrollable region around a wide table. Defaults to the caption, else `Table`. */
  region: string
}

const defaultRegionLabel = 'Table'

/** Lets a `TableCaption` give the `Table` its id, which names the scroll region. */
const CaptionContext = React.createContext<((id: string | undefined) => void) | null>(null)

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
 * The wrapper is a plain `div` while the table fits its column. Once the table is wider, the wrapper
 * scrolls sideways, so it becomes a focusable, named region: a keyboard user can scroll it and a
 * screen reader announces it. The name is `labels.region`, else the `TableCaption`, else `Table`.
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
    /** Name of the scroll region; the caption by default. */
    labels?: Partial<TableLabels>
  }) {
  const wrapper = React.useRef<HTMLDivElement>(null)
  const [scrolls, setScrolls] = React.useState(false)
  const [captionId, setCaptionId] = React.useState<string>()

  // The wrapper's own width and the table's content width both decide whether it scrolls.
  React.useLayoutEffect(() => {
    const element = wrapper.current
    if (!element) return undefined
    const measure = () => setScrolls(element.scrollWidth > element.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    return () => observer.disconnect()
  }, [])

  const regionName = labels?.region
  const region = scrolls
    ? {
        role: 'region',
        'aria-label': regionName ?? (captionId ? undefined : defaultRegionLabel),
        'aria-labelledby': regionName === undefined ? captionId : undefined,
        // Only a scrolling region needs a Tab stop (axe: scrollable-region-focusable).
        tabIndex: 0
      }
    : {}
  return (
    <div
      ref={wrapper}
      {...region}
      {...stylex.props(focusRing.root, s.container, border && s.bordered)}
    >
      <CaptionContext.Provider value={setCaptionId}>
        <ColumnBorderContext.Provider value={columnBorder}>
          <table {...props} {...stylex.props(s.table, style)} />
        </ColumnBorderContext.Provider>
      </CaptionContext.Provider>
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
        type.body2,
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
  id,
  style,
  ...props
}: Omit<React.ComponentProps<'caption'>, 'className' | 'style'> & StyleProp) {
  const setCaptionId = React.useContext(CaptionContext)
  const generatedId = React.useId()
  const captionId = id ?? generatedId
  React.useLayoutEffect(() => {
    setCaptionId?.(captionId)
    return () => setCaptionId?.(undefined)
  }, [setCaptionId, captionId])
  return <caption id={captionId} {...props} {...stylex.props(s.caption, style)} />
}
