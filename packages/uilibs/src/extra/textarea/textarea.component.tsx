import { Field as BaseField } from '@base-ui/react/field'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { useCallback } from 'react'
import { type ControlVariant, controlBase, controlVariants } from '../../styles/control.stylex'
import type { ControlSize } from '../../styles/types'
import { textareaSizes, textareaStyles as s } from './textarea.stylex'

export interface TextareaProps extends Omit<
  React.ComponentProps<'textarea'>,
  'className' | 'style'
> {
  /** Minimum height and type; `md` (64px) by default. */
  size?: ControlSize
  /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
  variant?: ControlVariant
  style?: stylex.StyleXStyles
  /** Grow the textarea with its content instead of a fixed height. */
  autoResize?: boolean
}

/** A multiline `Field` control: inside a `Field` it takes the label, description, error, and invalid state. */
export function Textarea({
  size = 'md',
  variant = 'outline',
  style,
  autoResize = false,
  onChange,
  ref,
  id,
  name,
  value,
  defaultValue,
  disabled,
  autoFocus,
  ...props
}: TextareaProps) {
  const resize = useCallback((element: HTMLTextAreaElement | null) => {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [])

  const setRef = useCallback(
    (element: HTMLElement | null) => {
      const textarea = element instanceof HTMLTextAreaElement ? element : null
      if (autoResize) resize(textarea)
      if (typeof ref === 'function') return ref(textarea)
      if (ref) ref.current = textarea
    },
    [autoResize, ref, resize]
  )

  // What the Field control owns: its id, name, value, disabled and autofocus state.
  const fieldProps = { id, name, value, defaultValue, disabled, autoFocus }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) resize(event.currentTarget)
    onChange?.(event)
  }

  return (
    <BaseField.Control
      ref={setRef}
      {...fieldProps}
      render={
        <textarea
          {...props}
          onChange={handleChange}
          {...stylex.props(
            controlBase.root,
            controlVariants[variant],
            textareaSizes[size],
            s.root,
            autoResize && s.autoResize,
            style
          )}
        />
      }
    />
  )
}
