/**
 * A button component that can be rendered as another HTML tag while remaining keyboard accessible.
 *
 * @see: https://base-ui.com/react/components/button
 *
 * BaseUI Anatomy:
 * <Button />
 */

import { Button as BaseButton } from '@base-ui/react/button'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { LabelledControlContext, Spinner } from '../../extra/spinner'
import { controlPress, controlSizes } from '../../styles/control.stylex'
import { glyphSize } from '../../styles/glyph'
import type { ColorRole, DenseControlSize, Glyph, PartProps } from '../../styles/types'
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
function buttonFill(variant: ButtonVariant, color?: ButtonColor) {
  return buttonFills[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')]
}

/**
 * A Button's press model, box, and fill, for an element that has to look like a Button without being
 * one (the Calendar's month arrows). Compose it through `style`-like props, then add the element's
 * own size.
 */
export function buttonAppearance(variant: ButtonVariant, color?: ButtonColor) {
  return [controlPress.root, buttonStyles.root, buttonFill(variant, color)]
}

/** The hover fill of a fill in a color, held at rest. */
function buttonHighlight(variant: ButtonVariant, color?: ButtonColor) {
  return buttonHighlighted[variant][color ?? (variant === 'solid' ? 'primary' : 'neutral')]
}

export interface ButtonProps extends PartProps<
  React.ComponentProps<typeof BaseButton>,
  'color' | 'render' | 'nativeButton'
> {
  /**
   * Makes the button a link: the element, such as `<a href='…' />` or a router link, is rendered
   * with the button's look and keeps its own role, so it is announced as a link. Mark the link of
   * the open page with `aria-current='page'` (a router link does). `disabled`, `loading`, and
   * `focusableWhenDisabled` do not apply to a link.
   */
  render?: React.ReactElement<React.ComponentProps<'a'>>
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
  loading: loadingProp = false,
  disabled,
  focusableWhenDisabled,
  render,
  ref,
  children,
  style,
  ...props
}: ButtonProps) {
  const group = useButtonGroup()
  const variant = variantProp ?? group?.variant ?? 'solid'
  const size = sizeProp ?? group?.size ?? 'medium'
  const loading = loadingProp && !render
  const iconOnly = React.Children.toArray(children).length === 0
  const glyph = glyphSize[size]
  const content = (
    <>
      {Icon ? <Icon size={glyph} aria-hidden /> : null}
      {children}
      {EndIcon ? <EndIcon size={glyph} aria-hidden /> : null}
    </>
  )
  const appearance = stylex.props(
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
  )
  if (render) {
    return (
      <ButtonLink render={render} ref={ref} props={{ ...props, ...appearance }}>
        {content}
      </ButtonLink>
    )
  }
  return (
    <BaseButton
      {...props}
      ref={ref}
      // Disabled but focusable: a loading button blocks presses (and a form submit) without
      // dropping out of the tab order mid-action.
      disabled={disabled || loading}
      focusableWhenDisabled={loading || focusableWhenDisabled}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
      {...appearance}
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

/**
 * The element of a button that navigates. Base UI's non-native button would give it
 * `role="button"`, so it renders through `useRender` instead: an `a` keeps its native role, press
 * model, and keyboard behavior. `ref` goes through `useRender`, because `mergeProps` does not merge refs.
 */
function ButtonLink({
  render,
  ref,
  props,
  children
}: {
  render: React.ReactElement<React.ComponentProps<'a'>>
  ref: React.Ref<HTMLElement> | undefined
  /** Typed as the button props `Button` receives; the rendered element takes them as they are. */
  props: React.ComponentProps<'button'>
  children: React.ReactNode
}) {
  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: mergeProps<'button'>(props, { children })
  })
}
