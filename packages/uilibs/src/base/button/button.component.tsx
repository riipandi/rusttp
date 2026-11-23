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
import {
  buttonFills,
  buttonHighlighted,
  buttonModifiers,
  buttonSizes,
  buttonStyles
} from './button.stylex'

export type ButtonVariant = keyof typeof buttonFills
export type ButtonColor =
  | 'primary'
  | 'neutral'
  | 'critical'
  | 'positive'
  | 'warning'
  | 'media'
  | 'inherit'

/** A glyph component, such as a Keyline icon; the button sizes it and hides it from assistive technology. */
export type ButtonGlyph = React.ComponentType<{ size?: number | string; 'aria-hidden'?: boolean }>

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
  /** The fill: `solid`, `faded` (a soft tint), `outline` (an edge), or `ghost` (text only). */
  variant?: ButtonVariant
  /**
   * The role. `primary` for `solid`, `neutral` for the other fills, by default; `critical` marks a
   * destructive or irreversible action. `media` is white on a photo or a dark surface, the same in
   * both themes. `inherit` takes the parent's text color for the label, the edge, and a tinted fill;
   * `solid` has no cut-out label in `inherit`, so it is a stronger tint.
   */
  color?: ButtonColor
  size?: keyof typeof buttonSizes
  /** Fully rounded ends. */
  rounded?: boolean
  /** Fills the width of its container. */
  fullWidth?: boolean
  /** Lifts the button with the raised shadow. */
  raised?: boolean
  /** Shows the hover fill without the pointer, such as for the current item of a list of buttons. Ignored while disabled or loading. */
  highlighted?: boolean
  /** A glyph before the label. With no children the button is icon-only and needs an `aria-label`. */
  icon?: ButtonGlyph
  /** A glyph after the label. */
  endIcon?: ButtonGlyph
  /**
   * Shows a spinner over the label and ignores presses until it clears. The button keeps its
   * width and its name, stays focusable, and reports `aria-busy` (a screen reader keeps the label).
   */
  loading?: boolean
  style?: stylex.StyleXStyles
}

export function Button({
  variant = 'solid',
  color,
  size = 'md',
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
  const glyph = size === 'xs' ? 14 : size === 'lg' ? 18 : 16
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
      {...stylex.props(
        controlPress.root,
        buttonStyles.root,
        buttonFill(variant, color),
        highlighted && !disabled && !loading && buttonHighlight(variant, color),
        (size === 'sm' || size === 'md' || size === 'lg') && controlSizes[size],
        buttonSizes[size],
        rounded && buttonModifiers.rounded,
        fullWidth && buttonModifiers.fullWidth,
        raised && buttonModifiers.raised,
        loading && buttonStyles.loading,
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
