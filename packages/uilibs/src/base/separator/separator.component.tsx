/**
 * A simple element used for visual separation of content.
 *
 * @see: https://base-ui.com/react/components/separator
 *
 * BaseUI Anatomy:
 * <Separator />
 */

import { Separator as BaseSeparator } from '@base-ui/react/separator'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { PartProps } from '../../styles/types'
import { separatorStyles as s } from './separator.stylex'
import { separatorOrientations as orientations } from './separator.stylex'
import { separatorColors, separatorInsets } from './separator.stylex'

export interface SeparatorProps extends PartProps<
  React.ComponentProps<typeof BaseSeparator>,
  'color'
> {
  /** The line: `neutral-faded` (default, a soft divider) or `neutral`. */
  color?: 'neutral-faded' | 'neutral'
  /** Stops short of the container's edges. */
  inset?: boolean
}

export function Separator({
  orientation = 'horizontal',
  color = 'neutral-faded',
  inset = false,
  style,
  ...props
}: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation}
      {...props}
      {...stylex.props(
        s.root,
        separatorColors[color],
        orientations[orientation],
        inset && separatorInsets[orientation],
        style
      )}
    />
  )
}
