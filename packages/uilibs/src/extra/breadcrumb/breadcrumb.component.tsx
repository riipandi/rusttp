import { ChevronRight, MoreHorizontal } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { visuallyHidden } from '../../styles/utils.stylex'
import { breadcrumbStyles as s } from './breadcrumb.stylex'

interface StyleXStyleProps {
  style?: stylex.StyleXStyles
}

/** Built-in words of the breadcrumb parts; each part reads the keys it shows. */
export interface BreadcrumbLabels {
  /** Name of the `nav` landmark. Defaults to `Breadcrumb`. */
  breadcrumb: string
  /** Text for assistive technology on the ellipsis. Defaults to `More`. */
  more: string
}

export type BreadcrumbColor = 'neutral' | 'primary'

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
  StyleXStyleProps &
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
}: Omit<React.ComponentProps<'ol'>, 'className' | 'style'> & StyleXStyleProps) {
  return <ol {...props} {...stylex.props(s.list, style)} />
}

export function BreadcrumbItem({
  style,
  ...props
}: Omit<React.ComponentProps<'li'>, 'className' | 'style'> & StyleXStyleProps) {
  return <li {...props} {...stylex.props(s.item, style)} />
}

export function BreadcrumbLink({
  style,
  ...props
}: Omit<React.ComponentProps<'a'>, 'className' | 'style'> & StyleXStyleProps) {
  const color = React.useContext(BreadcrumbColorContext)
  return <a {...props} {...stylex.props(s.link, color === 'primary' && s.linkPrimary, style)} />
}

export function BreadcrumbPage({
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleXStyleProps) {
  return (
    <span
      role='link'
      aria-disabled='true'
      aria-current='page'
      {...props}
      {...stylex.props(s.page, style)}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  style,
  ...props
}: Omit<React.ComponentProps<'li'>, 'className' | 'style'> & StyleXStyleProps) {
  return (
    <li role='presentation' aria-hidden {...props} {...stylex.props(s.separator, style)}>
      {children ?? <ChevronRight size={14} strokeWidth={1.5} aria-hidden />}
    </li>
  )
}

export function BreadcrumbEllipsis({
  labels,
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleXStyleProps & LabelsProps) {
  return (
    <span {...props} {...stylex.props(s.ellipsis, style)}>
      <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
      <span {...stylex.props(visuallyHidden.root)}>{{ ...defaultLabels, ...labels }.more}</span>
    </span>
  )
}
