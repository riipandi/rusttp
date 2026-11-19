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
import { controlBase, controlSizes, type ControlSize } from '../../styles/control.stylex'
import { inputStyles as s } from './input.stylex'

export interface InputProps extends Omit<
  React.ComponentProps<typeof BaseInput>,
  'className' | 'style' | 'size'
> {
  /** Control height and type; `md` (36px) by default. */
  size?: ControlSize
  style?: stylex.StyleXStyles
}

export function Input({ size = 'md', style, ...props }: InputProps) {
  return (
    <BaseInput {...props} {...stylex.props(controlBase.root, controlSizes[size], s.root, style)} />
  )
}
