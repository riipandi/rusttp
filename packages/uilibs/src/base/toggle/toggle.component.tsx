/**
 * A toggle button component.
 *
 * @see: https://base-ui.com/react/components/toggle
 *
 * BaseUI Anatomy:
 * <Toggle />
 */

import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { type DenseControlSize, controlPress, controlSizes } from '../../styles/control.stylex'
import { toggleStyles as s } from './toggle.stylex'
import { toggleRest, toggleSelected, toggleSizes, toggleVariants } from './toggle.stylex'

/** The fill: `ghost` is transparent until hover, `outline` adds an edge, `solid` rests on a neutral fill. */
export type ToggleVariant = 'ghost' | 'outline' | 'solid'
/** The color of the pressed state. */
export type ToggleColor = 'neutral' | 'primary' | 'critical' | 'positive' | 'warning'
export type ToggleSize = DenseControlSize

export interface ToggleProps extends Omit<
  React.ComponentProps<typeof BaseToggle>,
  'className' | 'style'
> {
  variant?: ToggleVariant
  /**
   * The fill of the pressed state: `ghost` a tint of `selectedColor`, `outline` an edge in it, and
   * `solid` its fill. Follows `variant` when unset, with `outline` pressing to the `ghost` tint.
   */
  selectedVariant?: ToggleVariant
  /** The color of the pressed state; `neutral` by default. */
  selectedColor?: ToggleColor
  size?: ToggleSize

  style?: stylex.StyleXStyles
}

export function Toggle({
  variant = 'ghost',
  selectedVariant = variant === 'solid' ? 'solid' : 'ghost',
  selectedColor = 'neutral',
  size = 'md',
  style,
  ...props
}: ToggleProps) {
  return (
    <BaseToggle
      {...props}
      {...stylex.props(
        controlPress.root,
        s.root,
        toggleVariants[variant],
        toggleRest[variant === 'solid' ? 'solid' : 'quiet'],
        toggleSelected[selectedVariant][selectedColor],
        size !== 'xs' && controlSizes[size],
        toggleSizes[size],
        style
      )}
    />
  )
}
