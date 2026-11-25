import { ChevronLeft, ChevronRight, MoreHorizontal } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { buttonSquare, LinkButton } from '../../base/button'
import { glyphSize } from '../../styles/glyph'
import type { DenseControlSize, StyleProp } from '../../styles/types'
import { visuallyHidden } from '../../styles/utils.stylex'
import { paginationStyles as s } from './pagination.stylex'

/** Built-in words of the pagination parts; each part reads the keys it shows. */
export interface PaginationLabels {
  /** Name of the `nav` landmark. Defaults to `Pagination`. */
  pagination: string
  /** Visible text of the previous link; empty for an icon-only link. Defaults to `Previous`. */
  previous: string
  /** Accessible name of the previous link. Defaults to `Go to previous page`. */
  previousPage: string
  /** Visible text of the next link; empty for an icon-only link. Defaults to `Next`. */
  next: string
  /** Accessible name of the next link. Defaults to `Go to next page`. */
  nextPage: string
  /** Text for assistive technology on the ellipsis. Defaults to `More pages`. */
  morePages: string
}

const defaultLabels: PaginationLabels = {
  pagination: 'Pagination',
  previous: 'Previous',
  previousPage: 'Go to previous page',
  next: 'Next',
  nextPage: 'Go to next page',
  morePages: 'More pages'
}

interface LabelsProps {
  labels?: Partial<PaginationLabels>
}

export function Pagination({
  style,
  labels,
  ...props
}: Omit<React.ComponentProps<'nav'>, 'className' | 'style'> & StyleProp & LabelsProps) {
  return (
    <nav
      aria-label={{ ...defaultLabels, ...labels }.pagination}
      {...props}
      {...stylex.props(s.nav, style)}
    />
  )
}

export function PaginationContent({
  style,
  ...props
}: Omit<React.ComponentProps<'ul'>, 'className' | 'style'> & StyleProp) {
  return <ul {...props} {...stylex.props(s.content, style)} />
}

export function PaginationItem({
  style,
  ...props
}: Omit<React.ComponentProps<'li'>, 'className' | 'style'> & StyleProp) {
  return <li {...props} {...stylex.props(style)} />
}

export interface PaginationLinkProps
  extends Omit<React.ComponentProps<'a'>, 'className' | 'style'>, StyleProp {
  isActive?: boolean
  /** The `Button` size; a page link is a square of it. Default `md`. */
  size?: DenseControlSize
}

/** A link of a given shape: `square` for a page number, rectangular for the text of previous and next. */
function PageLink({
  isActive,
  size = 'md',
  square,
  style,
  children,
  ...props
}: PaginationLinkProps & { square: boolean }) {
  // The text goes to the button, not the `a`: a button with no children reads as icon-only.
  return (
    <LinkButton
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      current={isActive}
      render={<a {...props} />}
      style={[square && buttonSquare[size], style]}
    >
      {children}
    </LinkButton>
  )
}

export function PaginationLink(props: PaginationLinkProps) {
  return <PageLink {...props} square />
}

export function PaginationPrevious({
  labels,
  style,
  ...props
}: Omit<PaginationLinkProps, 'size'> & LabelsProps) {
  const names = { ...defaultLabels, ...labels }
  return (
    <PageLink
      aria-label={names.previousPage}
      size='md'
      {...props}
      square={false}
      style={[s.previous, style]}
    >
      <Chevron direction='left' />
      <span {...stylex.props(s.linkText)}>{names.previous}</span>
    </PageLink>
  )
}

export function PaginationNext({
  labels,
  style,
  ...props
}: Omit<PaginationLinkProps, 'size'> & LabelsProps) {
  const names = { ...defaultLabels, ...labels }
  return (
    <PageLink
      aria-label={names.nextPage}
      size='md'
      {...props}
      square={false}
      style={[s.next, style]}
    >
      <span {...stylex.props(s.linkText)}>{names.next}</span>
      <Chevron direction='right' />
    </PageLink>
  )
}

export function PaginationEllipsis({
  labels,
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleProp & LabelsProps) {
  return (
    <span {...props} {...stylex.props(s.ellipsis, style)}>
      <MoreHorizontal size={glyphSize.md} strokeWidth={2} aria-hidden />
      <span {...stylex.props(visuallyHidden.root)}>
        {{ ...defaultLabels, ...labels }.morePages}
      </span>
    </span>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return direction === 'left' ? (
    <ChevronLeft size={glyphSize.md} strokeWidth={1.5} aria-hidden />
  ) : (
    <ChevronRight size={glyphSize.md} strokeWidth={1.5} aria-hidden />
  )
}
