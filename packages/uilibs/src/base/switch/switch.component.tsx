/**
 * A switch component that can be on or off.
 *
 * @see: https://base-ui.com/react/components/switch
 *
 * BaseUI Anatomy:
 * <Switch.Root>
 *   <Switch.Thumb />
 * </Switch.Root>
 */

import { Switch as BaseSwitch } from '@base-ui/react/switch'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { controlPress } from '../../styles/control.stylex'
import { switchStyles as s } from './switch.stylex'
import { switchRootSizes as rootSizes } from './switch.stylex'
import { switchThumbSizes as thumbSizes } from './switch.stylex'

export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchProps extends Omit<
  React.ComponentProps<typeof BaseSwitch.Root>,
  'className' | 'style'
> {
  size?: SwitchSize
  style?: stylex.StyleXStyles
}

export function Switch({ size = 'md', style, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      {...props}
      {...stylex.props(controlPress.root, s.root, rootSizes[size], style)}
    >
      <BaseSwitch.Thumb {...stylex.props(s.thumb, thumbSizes[size])} />
    </BaseSwitch.Root>
  )
}
