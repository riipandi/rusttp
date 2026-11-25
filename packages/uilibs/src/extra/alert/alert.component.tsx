import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { glyphSize } from '../../styles/glyph'
import type { ColorRole, Glyph, StyleProp } from '../../styles/types'
import { unitLength, type UnitStep } from '../../styles/utils.stylex'
import { alertStyles as s, alertColors as colors } from './alert.stylex'

export type AlertColor = ColorRole

export interface AlertProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style' | 'color'>, StyleProp {
  /** The color role of the notice; `neutral` by default. */
  color?: AlertColor
  /** A glyph before the text, in the role's color. */
  icon?: Glyph
  /**
   * Puts the `AlertAction` on the row with the text instead of pinned to the top corner; it wraps
   * under the text when the notice is too narrow for both.
   */
  inline?: boolean
  /**
   * Runs the notice out past its parent's padding by this many `unit` steps on each side, with no
   * side edges and square corners: a notice that spans a card or a panel. `0` only drops the edges.
   */
  bleed?: UnitStep
}

const InlineContext = React.createContext(false)

function isAction(child: React.ReactNode) {
  return React.isValidElement(child) && child.type === AlertAction
}

/**
 * A notice. It is a polite live region (`role='status'`): a screen reader announces it when it
 * changes, without interrupting. Pass `role='alert'` for an error the user must act on at once, or
 * `role={undefined}` for a notice that is static on load and should not be announced.
 */
export function Alert({
  color = 'neutral',
  icon: Icon,
  inline = false,
  bleed,
  style,
  children,
  ...props
}: AlertProps) {
  const row = Icon || inline
  // `inline` lifts the actions out of the stacked text so they sit beside it.
  const parts = React.Children.toArray(children)
  const actions = inline ? parts.filter(isAction) : []
  const content = inline ? parts.filter((child) => !isAction(child)) : children
  return (
    <div
      role='status'
      {...props}
      {...stylex.props(
        s.root,
        colors[color],
        row && s.row,
        inline && s.inline,
        bleed !== undefined && [s.bleed, s.bleedBy(`calc(-1 * ${unitLength(bleed)})`)],
        style
      )}
    >
      {Icon ? <Icon size={glyphSize.xl} aria-hidden {...stylex.props(s.glyph)} /> : null}
      {row ? (
        <div {...stylex.props(s.content, inline && s.contentInline)}>{content}</div>
      ) : (
        children
      )}
      <InlineContext.Provider value={inline}>{actions}</InlineContext.Provider>
    </div>
  )
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

/**
 * Slot pinned to the top-right corner of an `Alert`, for a dismiss or undo action; on an `inline`
 * alert it sits on the row with the text. It must be a direct child of the `Alert`.
 */
export function AlertAction({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  const inline = React.useContext(InlineContext)
  return <div {...props} {...stylex.props(s.action, inline && s.actionInline, style)} />
}
