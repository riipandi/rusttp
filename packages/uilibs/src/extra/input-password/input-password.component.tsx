/**
 * A password input with a visibility toggle, composed on top of InputGroup.
 *
 * @see: Base UI Input / InputGroup
 *
 * Anatomy:
 * <InputGroup>
 *   <InputGroupInput type="password|text" />
 *   <InputGroupAddon align="inline-end">
 *     <InputGroupButton aria-pressed={visible} aria-label="Show password">
 *       {visible ? hideIcon : showIcon}
 *     </InputGroupButton>
 *   </InputGroupAddon>
 * </InputGroup>
 */

import { Eye, EyeOff } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { ButtonVariant } from '../../base/button'
import type { Glyph } from '../../styles/types'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  type InputGroupButtonSize,
  InputGroupInput
} from '../input-group'

export interface InputPasswordLabels {
  /**
   * Name of the toggle. It stays the same in both states, and `aria-pressed` says which one it is
   * in, so a screen reader reads "Show password, pressed" and never "Hide password, pressed".
   * Defaults to `Show password`.
   */
  toggle: string
}

const defaultLabels: InputPasswordLabels = { toggle: 'Show password' }

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
  /** Glyph shown when the password is hidden (pressing it reveals the value). Defaults to an eye. */
  showIcon?: Glyph
  /** Glyph shown when the password is visible (pressing it hides the value). Defaults to a slashed eye. */
  hideIcon?: Glyph
  /** Accessible name of the toggle; English by default. */
  labels?: Partial<InputPasswordLabels>
  /** Toggle button variant. Defaults to `ghost`. */
  toggleVariant?: ButtonVariant
  /** Toggle button size. Defaults to `xsmall`. */
  toggleSize?: InputGroupButtonSize
}

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
  showIcon = Eye,
  hideIcon = EyeOff,
  labels,
  toggleVariant = 'ghost',
  toggleSize = 'xsmall',
  ...props
}: InputPasswordProps) {
  const [visible, setVisible] = useUncontrolledState(visibleProp, defaultVisible)
  const names = { ...defaultLabels, ...labels }

  const toggle = React.useCallback(() => {
    const next = !visible
    setVisible(next)
    onVisibleChange?.(next)
  }, [visible, onVisibleChange, setVisible])

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
          icon={visible ? hideIcon : showIcon}
          aria-pressed={visible}
          aria-label={names.toggle}
          onClick={toggle}
        />
      </InputGroupAddon>
    </InputGroup>
  )
}
