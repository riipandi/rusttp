import { ChevronRight, MoreHorizontal } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { glyphSize } from '../../styles/glyph'
import type { ColorRole, StyleProp } from '../../styles/types'
import { visuallyHidden } from '../../styles/utils.stylex'
import { breadcrumbStyles as s } from './breadcrumb.stylex'

/** Built-in words of the breadcrumb parts; each part reads the keys it shows. */
export interface BreadcrumbLabels {
  /** Name of the `nav` landmark. Defaults to `Breadcrumb`. */
  breadcrumb: string
  /** Text for assistive technology on the ellipsis. Defaults to `More`. */
  more: string
}

/** A breadcrumb is `neutral`, or `primary` for the current page. */
export type BreadcrumbColor = Extract<ColorRole, 'neutral' | 'primary'>

const BreadcrumbColorContext = React.createContext<BreadcrumbColor>('neutral')

const defaultLabels: BreadcrumbLabels = { breadcrumb: 'Breadcrumb', more: 'More' }

interface LabelsProps {
  labels?: Partial<BreadcrumbLabels>
}

export function Breadcrumb({
  color = 'neutral',
  style,
  labels,
  ...props
}: Omit<React.ComponentProps<'nav'>, 'className' | 'style' | 'color'> &
  StyleProp &
  LabelsProps & {
    /** The role of the links; `neutral` (default) or `primary`. */
    color?: BreadcrumbColor
  }) {
  return (
    <BreadcrumbColorContext.Provider value={color}>
      <nav
        aria-label={{ ...defaultLabels, ...labels }.breadcrumb}
        {...props}
        {...stylex.props(style)}
      />
    </BreadcrumbColorContext.Provider>
  )
}

export function BreadcrumbList({
  style,
  ...props
}: Omit<React.ComponentProps<'ol'>, 'className' | 'style'> & StyleProp) {
  return <ol {...props} {...stylex.props(s.list, style)} />
}

export function BreadcrumbItem({
  style,
  ...props
}: Omit<React.ComponentProps<'li'>, 'className' | 'style'> & StyleProp) {
  return <li {...props} {...stylex.props(s.item, style)} />
}

export function BreadcrumbLink({
  style,
  ...props
}: Omit<React.ComponentProps<'a'>, 'className' | 'style'> & StyleProp) {
  const color = React.useContext(BreadcrumbColorContext)
  return <a {...props} {...stylex.props(s.link, color === 'primary' && s.linkPrimary, style)} />
}

export function BreadcrumbPage({
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleProp) {
  return <span aria-current='page' {...props} {...stylex.props(s.page, style)} />
}

export function BreadcrumbSeparator({
  children,
  style,
  ...props
}: Omit<React.ComponentProps<'li'>, 'className' | 'style'> & StyleProp) {
  return (
    <li role='presentation' aria-hidden {...props} {...stylex.props(s.separator, style)}>
      {children ?? <ChevronRight size={glyphSize.xs} strokeWidth={1.5} aria-hidden />}
    </li>
  )
}

export function BreadcrumbEllipsis({
  labels,
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleProp & LabelsProps) {
  return (
    <span {...props} {...stylex.props(s.ellipsis, style)}>
      <MoreHorizontal size={glyphSize.md} strokeWidth={2} aria-hidden />
      <span {...stylex.props(visuallyHidden.root)}>{{ ...defaultLabels, ...labels }.more}</span>
    </span>
  )
}
