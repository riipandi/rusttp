import { ChevronRight, MoreHorizontal } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { glyphSize } from '../../styles/glyph'
import type { ColorRole, PartProps } from '../../styles/types'
import { mirrorInRtl, visuallyHidden } from '../../styles/utils.stylex'
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
}: PartProps<React.ComponentProps<'nav'>, 'color'> &
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

export function BreadcrumbList({ style, ...props }: PartProps<React.ComponentProps<'ol'>>) {
  return <ol {...props} {...stylex.props(s.list, style)} />
}

export function BreadcrumbItem({ style, ...props }: PartProps<React.ComponentProps<'li'>>) {
  return <li {...props} {...stylex.props(s.item, style)} />
}

export function BreadcrumbLink({ style, ...props }: PartProps<React.ComponentProps<'a'>>) {
  const color = React.useContext(BreadcrumbColorContext)
  return <a {...props} {...stylex.props(s.link, color === 'primary' && s.linkPrimary, style)} />
}

export function BreadcrumbPage({ style, ...props }: PartProps<React.ComponentProps<'span'>>) {
  return <span aria-current='page' {...props} {...stylex.props(s.page, style)} />
}

export function BreadcrumbSeparator({
  children,
  style,
  ...props
}: PartProps<React.ComponentProps<'li'>>) {
  return (
    <li role='presentation' aria-hidden {...props} {...stylex.props(s.separator, style)}>
      {children ?? (
        <ChevronRight
          size={glyphSize.xsmall}
          strokeWidth={1.5}
          aria-hidden
          {...stylex.props(mirrorInRtl.root)}
        />
      )}
    </li>
  )
}

export function BreadcrumbEllipsis({
  labels,
  style,
  ...props
}: PartProps<React.ComponentProps<'span'>> & LabelsProps) {
  return (
    <span {...props} {...stylex.props(s.ellipsis, style)}>
      <MoreHorizontal size={glyphSize.medium} strokeWidth={2} aria-hidden />
      <span {...stylex.props(visuallyHidden.root)}>{{ ...defaultLabels, ...labels }.more}</span>
    </span>
  )
}
