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
import { buttonFills, buttonSizes, buttonStyles } from './button.stylex'

export type ButtonVariant = keyof typeof buttonFills
export type ButtonColor = 'primary' | 'neutral' | 'critical'

/** The style of a fill in a color; the color is `primary` for `solid` and `neutral` for the other fills unless given. */
export function buttonFill(variant: ButtonVariant, color?: ButtonColor) {
  return buttonFills[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')]
}

export interface ButtonProps extends Omit<
  React.ComponentProps<typeof BaseButton>,
  'className' | 'style' | 'color'
> {
  /** The fill: `solid`, `faded` (a soft tint), `outline` (an edge), or `ghost` (text only). */
  variant?: ButtonVariant
  /** The role. `primary` for `solid`, `neutral` for the other fills, by default; `critical` marks a destructive or irreversible action. */
  color?: ButtonColor
  size?: keyof typeof buttonSizes
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
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
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
        (size === 'sm' || size === 'md' || size === 'lg') && controlSizes[size],
        buttonSizes[size],
        loading && buttonStyles.loading,
        style
      )}
    >
      <LabelledControlContext.Provider value>
        {loading ? (
          <>
            <span {...stylex.props(buttonStyles.content, buttonStyles.contentHidden)}>
              {children}
            </span>
            <span {...stylex.props(buttonStyles.spinner)}>
              <Spinner />
            </span>
          </>
        ) : (
          children
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
