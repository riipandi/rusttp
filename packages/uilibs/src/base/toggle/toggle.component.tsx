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
import { controlPress, controlSizes } from '../../styles/control.stylex'
import type { ColorRole, DenseControlSize, PartProps } from '../../styles/types'
import { buttonPress } from '../button/button.stylex'
import { toggleStyles as s } from './toggle.stylex'
import { toggleRest, toggleSelected, toggleSizes, toggleVariants } from './toggle.stylex'

/** The fill: `ghost` is transparent until hover, `outline` adds an edge, `solid` rests on a neutral fill. */
export type ToggleVariant = 'ghost' | 'outline' | 'solid'
/** The color of the pressed state. */
export type ToggleColor = ColorRole
export type ToggleSize = DenseControlSize

export interface ToggleProps extends PartProps<React.ComponentProps<typeof BaseToggle>> {
  variant?: ToggleVariant
  /**
   * The fill of the pressed state: `ghost` a tint of `selectedColor`, `outline` an edge in it, and
   * `solid` its fill. Follows `variant` when unset, with `outline` pressing to the `ghost` tint.
   */
  selectedVariant?: ToggleVariant
  /** The color of the pressed state; `neutral` by default. */
  selectedColor?: ToggleColor
  size?: ToggleSize
}

export function Toggle({
  variant = 'ghost',
  selectedVariant = variant === 'solid' ? 'solid' : 'ghost',
  selectedColor = 'neutral',
  size = 'medium',
  style,
  ...props
}: ToggleProps) {
  return (
    <BaseToggle
      {...props}
      {...stylex.props(
        controlPress.root,
        buttonPress.root,
        s.root,
        toggleVariants[variant],
        toggleRest[variant === 'solid' ? 'solid' : 'quiet'],
        toggleSelected[selectedVariant][selectedColor],
        size !== 'xsmall' && controlSizes[size],
        toggleSizes[size],
        style
      )}
    />
  )
}
