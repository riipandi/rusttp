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
import { toggleQuiet, toggleSizes, toggleSolid, toggleVariants } from './toggle.stylex'

/** The fill: `ghost` is transparent until hover, `outline` adds an edge, `solid` rests on a neutral fill. */
export type ToggleVariant = 'ghost' | 'outline' | 'solid'
/** The color of the pressed state. */
export type ToggleColor = 'neutral' | 'primary' | 'critical'
export type ToggleSize = DenseControlSize

export interface ToggleProps extends Omit<
  React.ComponentProps<typeof BaseToggle>,
  'className' | 'style'
> {
  variant?: ToggleVariant
  /** The color of the pressed state; `neutral` by default. */
  selectedColor?: ToggleColor
  size?: ToggleSize

  style?: stylex.StyleXStyles
}

export function Toggle({
  variant = 'ghost',
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
        (variant === 'solid' ? toggleSolid : toggleQuiet)[selectedColor],
        size !== 'xs' && controlSizes[size],
        toggleSizes[size],
        style
      )}
    />
  )
}
