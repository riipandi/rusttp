import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { focusRing } from '../../styles/utils.stylex'
import { tableStyles as s } from './table.stylex'

interface StyleXStyleProps {
  style?: stylex.StyleXStyles
}

export interface TableLabels {
  /** Name of the scrollable region around a wide table. Defaults to `Table`. */
  region: string
}

const defaultLabels: TableLabels = { region: 'Table' }

/**
 * The wrapper scrolls sideways when the table is wider than its column, so it is a focusable,
 * named region: a keyboard user can scroll it, and it is announced. Give the table a
 * `<caption>` or pass `labels.region` to say which table it is.
 */
export function Table({
  style,
  labels,
  ...props
}: Omit<React.ComponentProps<'table'>, 'className' | 'style'> &
  StyleXStyleProps & {
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
      {...stylex.props(focusRing.root, s.container)}
    >
      <table {...props} {...stylex.props(s.table, style)} />
    </div>
  )
}

export function TableHeader({
  style,
  ...props
}: Omit<React.ComponentProps<'thead'>, 'className' | 'style'> & StyleXStyleProps) {
  return <thead {...props} {...stylex.props(style)} />
}

export function TableBody({
  style,
  ...props
}: Omit<React.ComponentProps<'tbody'>, 'className' | 'style'> & StyleXStyleProps) {
  return <tbody {...props} {...stylex.props(style)} />
}

export function TableFooter({
  style,
  ...props
}: Omit<React.ComponentProps<'tfoot'>, 'className' | 'style'> & StyleXStyleProps) {
  return <tfoot {...props} {...stylex.props(s.footer, style)} />
}

export function TableRow({
  style,
  ...props
}: Omit<React.ComponentProps<'tr'>, 'className' | 'style'> & StyleXStyleProps) {
  return <tr {...props} {...stylex.props(s.row, style)} />
}

export function TableHead({
  style,
  ...props
}: Omit<React.ComponentProps<'th'>, 'className' | 'style'> & StyleXStyleProps) {
  return <th {...props} {...stylex.props(s.head, style)} />
}

export function TableCell({
  style,
  ...props
}: Omit<React.ComponentProps<'td'>, 'className' | 'style'> & StyleXStyleProps) {
  return <td {...props} {...stylex.props(s.cell, style)} />
}

export function TableCaption({
  style,
  ...props
}: Omit<React.ComponentProps<'caption'>, 'className' | 'style'> & StyleXStyleProps) {
  return <caption {...props} {...stylex.props(s.caption, style)} />
}
