import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { alertStyles as s, alertColors as colors } from './alert.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export type AlertColor = 'neutral' | 'primary' | 'positive' | 'warning' | 'critical'

export interface AlertProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style' | 'color'>, StyleProp {
  /** The color role of the notice; `neutral` by default. */
  color?: AlertColor
}

/**
 * A notice. It is a polite live region (`role='status'`): a screen reader announces it when it
 * changes, without interrupting. Pass `role='alert'` for an error the user must act on at once, or
 * `role={undefined}` for a notice that is static on load and should not be announced.
 */
export function Alert({ color = 'neutral', style, ...props }: AlertProps) {
  return <div role='status' {...props} {...stylex.props(s.root, colors[color], style)} />
}

export type AlertTitleLevel = 1 | 2 | 3 | 4 | 5 | 6

/** The title is a heading: `level` is its `<h1>` to `<h6>`, `5` by default; match the page's outline. */
export function AlertTitle({
  level = 5,
  style,
  ...props
}: Omit<React.ComponentProps<'h5'>, 'className' | 'style'> &
  StyleProp & { level?: AlertTitleLevel }) {
  const Heading = `h${level}` as const
  return <Heading {...props} {...stylex.props(s.title, style)} />
}

export function AlertDescription({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.description, style)} />
}

/** Slot pinned to the top-right corner of an `Alert`, for a dismiss or undo action. */
export function AlertAction({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.action, style)} />
}
