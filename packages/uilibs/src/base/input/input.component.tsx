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
  type ControlVariant
} from '../../styles/control.stylex'
import type { ControlSize } from '../../styles/types'
import { buttonGroupMember, useButtonGroup } from '../button/button-group.context'
import { inputStyles as s } from './input.stylex'

export interface InputProps extends Omit<
  React.ComponentProps<typeof BaseInput>,
  'className' | 'style' | 'size'
> {
  /** Control height and type; the `ButtonGroup`'s size, else `md` (36px). */
  size?: ControlSize
  /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
  variant?: ControlVariant
  style?: stylex.StyleXStyles
}

export function Input({ size, variant = 'outline', style, ...props }: InputProps) {
  const group = useButtonGroup()
  return (
    <BaseInput
      {...props}
      {...stylex.props(
        controlBase.root,
        controlSizes[size ?? group?.size ?? 'md'],
        controlVariants[variant],
        s.root,
        buttonGroupMember(group, false),
        style
      )}
    />
  )
}
