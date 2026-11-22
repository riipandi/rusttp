/**
 * A password input with a visibility toggle, composed on top of InputGroup.
 *
 * @see: Base UI Input / InputGroup
 *
 * Anatomy:
 * <InputGroup>
 *   <InputGroupInput type="password|text" />
 *   <InputGroupAddon align="inline-end">
 *     <InputGroupButton aria-pressed={visible} aria-label=…>
 *       {visible ? hideIcon : showIcon}
 *     </InputGroupButton>
 *   </InputGroupAddon>
 * </InputGroup>
 */

import { Eye, EyeOff } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { ButtonVariant } from '../../base/button'
import { Icon } from '../icon'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  type InputGroupButtonSize,
  InputGroupInput
} from '../input-group'

export interface InputPasswordLabels {
  /** Name of the toggle while the password is hidden. Defaults to `Show password`. */
  show: string
  /** Name of the toggle while the password is visible. Defaults to `Hide password`. */
  hide: string
}

const defaultLabels: InputPasswordLabels = { show: 'Show password', hide: 'Hide password' }

export interface InputPasswordProps extends Omit<
  React.ComponentProps<typeof InputGroupInput>,
  'type' | 'style'
> {
  style?: stylex.StyleXStyles
  /** Controlled visibility state. When provided, the input becomes controlled. */
  visible?: boolean
  /** Initial visibility state when uncontrolled. Defaults to `false` (obscured). */
  defaultVisible?: boolean
  /** Fired when the user toggles visibility. */
  onVisibleChange?: (visible: boolean) => void
  /** Icon shown when the password is hidden (pressing it reveals the value). Defaults to an eye. */
  showIcon?: React.ReactNode
  /** Icon shown when the password is visible (pressing it hides the value). Defaults to a slashed eye. */
  hideIcon?: React.ReactNode
  /** Accessible names of the toggle; English by default. */
  labels?: Partial<InputPasswordLabels>
  /** Toggle button variant. Defaults to `ghost`. */
  toggleVariant?: ButtonVariant
  /** Toggle button size. Defaults to `icon-xs`. */
  toggleSize?: InputGroupButtonSize
}

const defaultShowIcon = <Icon svg={Eye} size={16} color='neutralFaded' />
const defaultHideIcon = <Icon svg={EyeOff} size={16} color='neutralFaded' />

/** Resolve a controlled or uncontrolled boolean. */
function useUncontrolledState(
  controlled: boolean | undefined,
  defaultState: boolean
): [boolean, (next: boolean) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultState)
  const isControlled = controlled !== undefined
  const value = controlled ?? uncontrolled
  const setValue = (next: boolean) => {
    if (!isControlled) setUncontrolled(next)
  }
  return [value, setValue]
}

export function InputPassword({
  size,
  variant,
  style,
  visible: visibleProp,
  defaultVisible = false,
  onVisibleChange,
  showIcon,
  hideIcon,
  labels,
  toggleVariant = 'ghost',
  toggleSize = 'icon-xs',
  ...props
}: InputPasswordProps) {
  const [visible, setVisible] = useUncontrolledState(visibleProp, defaultVisible)
  const names = { ...defaultLabels, ...labels }

  const toggle = React.useCallback(() => {
    const next = !visible
    setVisible(next)
    onVisibleChange?.(next)
  }, [visible, onVisibleChange, setVisible])

  const showIconNode = showIcon ?? defaultShowIcon
  const hideIconNode = hideIcon ?? defaultHideIcon

  return (
    <InputGroup size={size} variant={variant} style={style}>
      <InputGroupInput
        type={visible ? 'text' : 'password'}
        autoComplete='new-password'
        {...props}
      />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          type='button'
          variant={toggleVariant}
          size={toggleSize}
          aria-pressed={visible}
          aria-label={visible ? names.hide : names.show}
          onClick={toggle}
        >
          {visible ? hideIconNode : showIconNode}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
