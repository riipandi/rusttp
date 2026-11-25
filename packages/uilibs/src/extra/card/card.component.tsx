import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { type } from '../../styles/type.stylex'
import { cardStates, cardStyles as s, cardSizes as sizes } from './card.stylex'

interface DivProps extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  style?: stylex.StyleXStyles
}

export type CardSize = 'sm' | 'md'

export function Card({
  size = 'md',
  selected = false,
  raised = false,
  style,
  ...props
}: DivProps & {
  size?: CardSize
  /** Marks the card as chosen: a primary edge and `data-selected`. Name the choice for assistive technology yourself (a `role` and `aria-selected`, or a control inside). */
  selected?: boolean
  /** Lifts the card with the raised shadow. */
  raised?: boolean
}) {
  return (
    <div
      data-selected={selected || undefined}
      {...props}
      {...stylex.props(
        s.root,
        sizes[size],
        raised && cardStates.raised,
        selected && cardStates.selected,
        style
      )}
    />
  )
}

export function CardHeader({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function CardTitle({
  style,
  ...props
}: Omit<React.ComponentProps<'h3'>, 'className' | 'style'> & {
  style?: stylex.StyleXStyles
}) {
  return <h3 {...props} {...stylex.props(type.body1, s.title, style)} />
}

export function CardDescription({
  style,
  ...props
}: Omit<React.ComponentProps<'p'>, 'className' | 'style'> & {
  style?: stylex.StyleXStyles
}) {
  return <p {...props} {...stylex.props(s.description, style)} />
}

/** Slot for a header-level action (e.g. a button), pinned top-right. */
export function CardAction({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.action, style)} />
}

export function CardContent({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.content, style)} />
}

export function CardFooter({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.footer, style)} />
}
