import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
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
      {children ?? (
        <svg
          width='14'
          height='14'
          viewBox={`0 0 16 16`}
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden
        >
          <path d={`m6 3 5 5-5 5`} />
        </svg>
      )}
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
      <svg width='16' height='16' viewBox={`0 0 16 16`} fill='currentColor' aria-hidden>
        <circle cx='3' cy='8' r='1.25' />
        <circle cx='8' cy='8' r='1.25' />
        <circle cx='13' cy='8' r='1.25' />
      </svg>
      <span {...stylex.props(s.srOnly)}>{label}</span>
    </span>
  )
}
