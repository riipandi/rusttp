/**
 * An input component that can be used in forms.
 *
 * @see: https://base-ui.com/react/components/input
 *
 * BaseUI Anatomy:
 * <Input />
 */

import { Input as BaseInput } from '@base-ui/react/input'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {
  controlBase,
  controlSizes,
  controlVariants,
  type ControlSize,
  type ControlVariant
} from '../../styles/control.stylex'
import { inputStyles as s } from './input.stylex'

export interface InputProps extends Omit<
  React.ComponentProps<typeof BaseInput>,
  'className' | 'style' | 'size'
> {
  /** Control height and type; `md` (36px) by default. */
  size?: ControlSize
  /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
  variant?: ControlVariant
  style?: stylex.StyleXStyles
}

export function Input({ size = 'md', variant = 'outline', style, ...props }: InputProps) {
  return (
    <BaseInput
      {...props}
      {...stylex.props(
        controlBase.root,
        controlSizes[size],
        controlVariants[variant],
        s.root,
        style
      )}
    />
  )
}
