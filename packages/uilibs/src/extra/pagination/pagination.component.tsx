import { ChevronLeft, ChevronRight, MoreHorizontal } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { LinkButton, type buttonSizes } from '../../base/button'
import { visuallyHidden } from '../../styles/utils.stylex'
import { paginationStyles as s } from './pagination.stylex'

interface StyleXStyleProps {
  style?: stylex.StyleXStyles
}

export function Pagination({
  style,
  ...props
}: Omit<React.ComponentProps<'nav'>, 'className' | 'style'> & StyleXStyleProps) {
  return <nav aria-label='Pagination' {...props} {...stylex.props(s.nav, style)} />
}

export function PaginationContent({
  style,
  ...props
}: Omit<React.ComponentProps<'ul'>, 'className' | 'style'> & StyleXStyleProps) {
  return <ul {...props} {...stylex.props(s.content, style)} />
}

export function PaginationItem({
  style,
  ...props
}: Omit<React.ComponentProps<'li'>, 'className' | 'style'> & StyleXStyleProps) {
  return <li {...props} {...stylex.props(style)} />
}

export interface PaginationLinkProps
  extends Omit<React.ComponentProps<'a'>, 'className' | 'style'>, StyleXStyleProps {
  isActive?: boolean
  size?: keyof typeof buttonSizes
}

export function PaginationLink({
  isActive,
  size = 'icon-md',
  style,
  ...props
}: PaginationLinkProps) {
  return (
    <LinkButton
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      current={isActive}
      render={<a {...props} />}
      style={style}
    />
  )
}

export function PaginationPrevious({
  text = 'Previous',
  style,
  ...props
}: Omit<PaginationLinkProps, 'size'> & { text?: string }) {
  return (
    <PaginationLink
      aria-label='Go to previous page'
      size='md'
      {...props}
      style={[s.previous, style]}
    >
      <Chevron direction='left' />
      <span {...stylex.props(s.linkText)}>{text}</span>
    </PaginationLink>
  )
}

export function PaginationNext({
  text = 'Next',
  style,
  ...props
}: Omit<PaginationLinkProps, 'size'> & { text?: string }) {
  return (
    <PaginationLink aria-label='Go to next page' size='md' {...props} style={[s.next, style]}>
      <span {...stylex.props(s.linkText)}>{text}</span>
      <Chevron direction='right' />
    </PaginationLink>
  )
}

export function PaginationEllipsis({
  label = 'More pages',
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> &
  StyleXStyleProps & {
    /** Text for assistive technology; the dots are decoration. Defaults to `More pages`. */
    label?: string
  }) {
  return (
    <span {...props} {...stylex.props(s.ellipsis, style)}>
      <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
      <span {...stylex.props(visuallyHidden.root)}>{label}</span>
    </span>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return direction === 'left' ? (
    <ChevronLeft size={16} strokeWidth={1.5} aria-hidden />
  ) : (
    <ChevronRight size={16} strokeWidth={1.5} aria-hidden />
  )
}
