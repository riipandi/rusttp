import { ChevronRight, MoreHorizontal } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { visuallyHidden } from '../../styles/utils.stylex'
import { breadcrumbStyles as s } from './breadcrumb.stylex'

interface StyleXStyleProps {
  style?: stylex.StyleXStyles
}

export function Breadcrumb({
  style,
  ...props
}: Omit<React.ComponentProps<'nav'>, 'className' | 'style'> & StyleXStyleProps) {
  return <nav aria-label='Breadcrumb' {...props} {...stylex.props(style)} />
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
  return <a {...props} {...stylex.props(s.link, style)} />
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
  label = 'More',
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> &
  StyleXStyleProps & {
    /** Text for assistive technology; the dots are decoration. Defaults to `More`. */
    label?: string
  }) {
  return (
    <span {...props} {...stylex.props(s.ellipsis, style)}>
      <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
      <span {...stylex.props(visuallyHidden.root)}>{label}</span>
    </span>
  )
}
