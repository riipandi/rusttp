import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { type } from '../../styles/type.stylex'
import type { PartProps } from '../../styles/types'
import { cardStates, cardStyles as s, cardSizes as sizes } from './card.stylex'

interface DivProps extends PartProps<React.ComponentProps<'div'>> {}

export type CardSize = 'small' | 'medium'

export interface CardProps extends PartProps<useRender.ComponentProps<'div'>> {
  size?: CardSize
  /** Marks the card as chosen: a primary edge and `data-selected`. Name the choice for assistive technology yourself (a `role` and `aria-selected`, or a control inside). */
  selected?: boolean
  /** Lifts the card with the raised shadow. */
  raised?: boolean
}

/** Renders a `div`; `render` swaps it for another element, such as an `article` or a link. */
export function Card({
  size = 'medium',
  selected = false,
  raised = false,
  style,
  render,
  ...props
}: CardProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        ...stylex.props(
          s.root,
          sizes[size],
          raised && cardStates.raised,
          selected && cardStates.selected,
          style
        ),
        'data-selected': selected || undefined
      } as React.ComponentPropsWithRef<'div'>,
      props
    ),
    render
  })
}

export function CardHeader({ style, ...props }: DivProps) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function CardTitle({ style, ...props }: PartProps<React.ComponentProps<'h3'>>) {
  return <h3 {...props} {...stylex.props(type.body1, s.title, style)} />
}

export function CardDescription({ style, ...props }: PartProps<React.ComponentProps<'p'>>) {
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
