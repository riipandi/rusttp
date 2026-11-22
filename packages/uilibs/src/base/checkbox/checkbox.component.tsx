/**
 * An easily stylable checkbox component.
 *
 * @see: https://base-ui.com/react/components/checkbox
 * @see: https://base-ui.com/react/components/checkbox-group
 *
 * BaseUI Anatomy for Checkbox:
 * <Checkbox.Root>
 *   <Checkbox.Indicator />
 * </Checkbox.Root>
 *
 * BaseUI Anatomy for Checkbox Group:
 * <CheckboxGroup>
 *   <Checkbox.Root />
 * </CheckboxGroup>
 */

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'
import { Check, Minus } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { controlPress } from '../../styles/control.stylex'
import { checkboxSizes, checkboxStyles, checkboxGroupStyles } from './checkbox.stylex'

export type CheckboxSize = 'sm' | 'md' | 'lg'

const glyphSize = { sm: 10, md: 12, lg: 14 } as const

export interface CheckboxProps extends Omit<
  React.ComponentProps<typeof BaseCheckbox.Root>,
  'className' | 'style'
> {
  /** Box size: `sm` 12px, `md` 16px (default), `lg` 20px. */
  size?: CheckboxSize
  style?: stylex.StyleXStyles
}

export function Checkbox({ size = 'md', style, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      {...props}
      {...stylex.props(controlPress.root, checkboxStyles.root, checkboxSizes[size], style)}
    >
      <BaseCheckbox.Indicator
        render={(indicatorProps, state) => (
          <span {...indicatorProps} {...stylex.props(checkboxStyles.indicator)}>
            {state.indeterminate ? (
              <Minus size={glyphSize[size]} strokeWidth={2} aria-hidden />
            ) : (
              <Check size={glyphSize[size]} strokeWidth={2} aria-hidden />
            )}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  )
}

export interface CheckboxGroupProps extends Omit<
  React.ComponentProps<typeof BaseCheckboxGroup>,
  'className' | 'style'
> {
  style?: stylex.StyleXStyles
}

/**
 * Shares checked state across Checkboxes: give each child Checkbox a `name`
 * and control the group with `value` / `defaultValue` (arrays of names).
 * A parent checkbox is supported via Base UI's `allValues`.
 */
export function CheckboxGroup({ style, ...props }: CheckboxGroupProps) {
  return <BaseCheckboxGroup {...props} {...stylex.props(checkboxGroupStyles.root, style)} />
}
