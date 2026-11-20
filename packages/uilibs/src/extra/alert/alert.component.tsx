import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { Tone } from '../../styles/tone'
import { alertStyles as s, alertTones as tones } from './alert.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export interface AlertProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'>, StyleProp {
  /** The color role of the notice; `neutral` by default. */
  tone?: Tone
}

/**
 * A notice. It is a polite live region (`role='status'`): a screen reader announces it when it
 * changes, without interrupting. Pass `role='alert'` for an error the user must act on at once, or
 * `role={undefined}` for a notice that is static on load and should not be announced.
 */
export function Alert({ tone = 'neutral', style, ...props }: AlertProps) {
  return <div role='status' {...props} {...stylex.props(s.root, tones[tone], style)} />
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
