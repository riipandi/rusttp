import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { StyleProp } from '../../styles/types'
import { emptyStyles as s, emptyMediaVariants as mediaVariants } from './empty.stylex'

type DivProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp

/** Renders a `div`; `render` swaps it for another element, such as a `section`. */
export function Empty({
  style,
  render,
  ...props
}: Omit<useRender.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(stylex.props(s.root, style), props),
    render
  })
}

export function EmptyHeader({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export type EmptyMediaVariant = 'default' | 'icon'

export function EmptyMedia({
  variant = 'default',
  style,
  ...props
}: DivProps & { variant?: EmptyMediaVariant }) {
  return <div {...props} {...stylex.props(s.media, mediaVariants[variant], style)} />
}

export function EmptyTitle({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.title, style)} />
}

export function EmptyDescription({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.description, style)} />
}

export function EmptyContent({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.content, style)} />
}
