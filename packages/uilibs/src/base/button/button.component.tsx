/**
 * A button component that can be rendered as another HTML tag while remaining keyboard accessible.
 *
 * @see: https://base-ui.com/react/components/button
 *
 * BaseUI Anatomy:
 * <Button />
 */

import { Button as BaseButton } from '@base-ui/react/button'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { LabelledControlContext, Spinner } from '../../extra/spinner'
import { controlPress, controlSizes } from '../../styles/control.stylex'
import { glyphSize } from '../../styles/glyph'
import type { ColorRole, DenseControlSize, Glyph } from '../../styles/types'
import { buttonGroupMember, useButtonGroup } from './button-group.context'
import {
  buttonFills,
  buttonHighlighted,
  buttonModifiers,
  buttonSizes,
  buttonSquare,
  buttonStyles
} from './button.stylex'

export type ButtonVariant = keyof typeof buttonFills
/** Every role, plus `media` (fixed white on a photo or dark surface) and `inherit` (the text color around it). */
export type ButtonColor = ColorRole | 'media' | 'inherit'

/** The style of a fill in a color; the color is `primary` for `solid` and `neutral` for the other fills unless given. */
export function buttonFill(variant: ButtonVariant, color?: ButtonColor) {
  return buttonFills[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')]
}

/** The hover fill of a fill in a color, held at rest. */
function buttonHighlight(variant: ButtonVariant, color?: ButtonColor) {
  return buttonHighlighted[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')]
}

export interface ButtonProps extends Omit<
  React.ComponentProps<typeof BaseButton>,
  'className' | 'style' | 'color'
> {
  /**
   * The fill: `solid`, `faded` (a soft tint), `outline` (an edge), or `ghost` (text only). Inside a
   * `ButtonGroup` it takes the group's `variant`, else `solid`.
   */
  variant?: ButtonVariant
  /**
   * The role. `primary` for `solid`, `neutral` for the other fills, by default; `critical` marks a
   * destructive or irreversible action. `media` is white on a photo or a dark surface, the same in
   * both themes. `inherit` takes the parent's text color for the label, the edge, and a tinted fill;
   * `solid` has no cut-out label in `inherit`, so it is a stronger tint.
   */
  color?: ButtonColor
  /**
   * Height and type; inside a `ButtonGroup` the group's size, else `medium`. It is never the shape: a
   * button with no children is a square (see `icon`), and `buttonSquare[size]` squares any other.
   */
  size?: DenseControlSize
  /** Fully rounded ends. */
  rounded?: boolean
  /** Fills the width of its container. */
  fullWidth?: boolean
  /** Lifts the button with the raised shadow. */
  raised?: boolean
  /** Shows the hover fill without the pointer, such as for the current item of a list of buttons. Ignored while disabled or loading. */
  highlighted?: boolean
  /** A glyph before the label. With no children the button is icon-only and needs an `aria-label`. */
  icon?: Glyph
  /** A glyph after the label. */
  endIcon?: Glyph
  /**
   * Shows a spinner over the label and ignores presses until it clears. The button keeps its
   * width and its name, stays focusable, and reports `aria-busy` (a screen reader keeps the label).
   */
  loading?: boolean
  style?: stylex.StyleXStyles
}

export function Button({
  variant: variantProp,
  color,
  size: sizeProp,
  rounded = false,
  fullWidth = false,
  raised = false,
  highlighted = false,
  icon: Icon,
  endIcon: EndIcon,
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const group = useButtonGroup()
  const variant = variantProp ?? group?.variant ?? 'solid'
  const size = sizeProp ?? group?.size ?? 'medium'
  const iconOnly = React.Children.toArray(children).length === 0
  const glyph = glyphSize[size]
  const content = (
    <>
      {Icon ? <Icon size={glyph} aria-hidden /> : null}
      {children}
      {EndIcon ? <EndIcon size={glyph} aria-hidden /> : null}
    </>
  )
  return (
    <BaseButton
      {...props}
      // Disabled but focusable: a loading button blocks presses (and a form submit) without
      // dropping out of the tab order mid-action.
      disabled={disabled || loading}
      focusableWhenDisabled={loading || props.focusableWhenDisabled}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
      {...stylex.props(
        controlPress.root,
        buttonStyles.root,
        buttonFill(variant, color),
        highlighted && !disabled && !loading && buttonHighlight(variant, color),
        size !== 'xsmall' && controlSizes[size],
        buttonSizes[size],
        iconOnly && buttonSquare[size],
        rounded && buttonModifiers.rounded,
        fullWidth && buttonModifiers.fullWidth,
        raised && buttonModifiers.raised,
        loading && buttonStyles.loading,
        buttonGroupMember(group, variant === 'solid' || variant === 'faded'),
        style
      )}
    >
      <LabelledControlContext.Provider value>
        {loading ? (
          <>
            <span {...stylex.props(buttonStyles.content, buttonStyles.contentHidden)}>
              {content}
            </span>
            <span {...stylex.props(buttonStyles.spinner)}>
              <Spinner />
            </span>
          </>
        ) : (
          content
        )}
      </LabelledControlContext.Provider>
    </BaseButton>
  )
}

export interface LinkButtonProps extends Omit<ButtonProps, 'render' | 'nativeButton' | 'loading'> {
  /** The link element: `<a href='…' />`, or a router link such as `<Link to='…' />`. */
  render: React.ReactElement<React.ComponentProps<'a'>>
  /** Marks the link of the page the user is on. */
  current?: boolean
}

/**
 * A button that navigates. Base UI gives a non-native button `role="button"`, which would announce
 * a link as a button, so the role goes back to `link` on the rendered element.
 */
export function LinkButton({ render, current, ...props }: LinkButtonProps) {
  return (
    <Button
      {...props}
      nativeButton={false}
      render={React.cloneElement(render, {
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- deliberate: the element is the link, Base UI only overrides its role
        role: 'link',
        'aria-current': current ? 'page' : undefined
      })}
    />
  )
}
