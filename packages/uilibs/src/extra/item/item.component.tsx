import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Separator } from '../../base/separator'
import type { StyleProp } from '../../styles/types'
import { focusRing } from '../../styles/utils.stylex'
import { itemStyles as s, itemVariants, itemSizes } from './item.stylex'
import { itemMediaVariants as mediaVariants } from './item.stylex'

type DivProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp

/** True inside an `ItemGroup`, whose `list` role needs `listitem` children. */
const ItemGroupContext = React.createContext(false)

export function ItemGroup({ style, ...props }: DivProps) {
  return (
    <ItemGroupContext.Provider value>
      <div role='list' {...props} {...stylex.props(s.group, style)} />
    </ItemGroupContext.Provider>
  )
}

export function ItemSeparator({ ...props }: React.ComponentProps<typeof Separator>) {
  // In a list, a separator is not an item: it is only the line between two.
  const inGroup = React.useContext(ItemGroupContext)
  return (
    <Separator
      orientation='horizontal'
      {...(inGroup ? { role: 'none', 'aria-orientation': undefined } : {})}
      {...props}
    />
  )
}

/** `ghost` is the bare row, `outline` adds an edge, `faded` a soft neutral fill. */
export type ItemVariant = 'ghost' | 'outline' | 'faded'
export type ItemSize = 'xsmall' | 'small' | 'medium'

export interface ItemProps
  extends Omit<useRender.ComponentProps<'div'>, 'className' | 'style'>, StyleProp {
  variant?: ItemVariant
  size?: ItemSize
}

export function Item({ variant = 'ghost', size = 'medium', style, render, ...props }: ItemProps) {
  const inGroup = React.useContext(ItemGroupContext)
  const item = useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      stylex.props(focusRing.root, s.root, itemVariants[variant], itemSizes[size], style),
      props
    ),
    render
  })
  // The `listitem` role sits on a wrapper, not on the item: a rendered link keeps its own role.
  return inGroup ? <div role='listitem'>{item}</div> : item
}

export type ItemMediaVariant = 'default' | 'icon' | 'image'

export function ItemMedia({
  variant = 'default',
  style,
  ...props
}: DivProps & { variant?: ItemMediaVariant }) {
  return <div {...props} {...stylex.props(s.media, mediaVariants[variant], style)} />
}

export function ItemContent({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.content, style)} />
}

export function ItemTitle({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.title, style)} />
}

export function ItemDescription({
  style,
  ...props
}: Omit<React.ComponentProps<'p'>, 'className' | 'style'> & StyleProp) {
  return <p {...props} {...stylex.props(s.description, style)} />
}

export function ItemActions({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.actions, style)} />
}

export function ItemHeader({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.headerFooter, style)} />
}

export function ItemFooter({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.headerFooter, style)} />
}
