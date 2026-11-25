/**
 * A radio button component for selecting one option from a group.
 *
 * @see: https://base-ui.com/react/components/radio
 * @see: https://base-ui.com/react/components/radio-group
 *
 * BaseUI Anatomy:
 * <RadioGroup>
 *   <Radio.Root>
 *     <Radio.Indicator />
 *   </Radio.Root>
 * </RadioGroup>
 */

import { Radio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { controlPress } from '../../styles/control.stylex'
import type { ControlSize, StyleProp } from '../../styles/types'
import { radioIndicatorSizes, radioSizes, radioStyles as s } from './radio.stylex'

export function RadioGroup({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseRadioGroup>, 'className' | 'style'> & StyleProp) {
  return <BaseRadioGroup {...props} {...stylex.props(s.group, style)} />
}

export type RadioSize = ControlSize

export function RadioGroupItem({
  size = 'md',
  style,
  ...props
}: Omit<React.ComponentProps<typeof Radio.Root>, 'className' | 'style'> &
  StyleProp & {
    /** Circle size: `sm` 12px, `md` 16px (default), `lg` 20px. */
    size?: RadioSize
  }) {
  return (
    <Radio.Root {...props} {...stylex.props(controlPress.root, s.item, radioSizes[size], style)}>
      <Radio.Indicator {...stylex.props(s.indicator, radioIndicatorSizes[size])} />
    </Radio.Root>
  )
}
