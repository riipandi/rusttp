import { Field as BaseField } from '@base-ui/react/field'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { useCallback } from 'react'
import { type ControlVariant, controlBase, controlVariants } from '../../styles/control.stylex'
import type { ControlSize, PartProps } from '../../styles/types'
import { textareaSizes, textareaStyles as s } from './textarea.stylex'

export interface TextareaProps extends PartProps<React.ComponentProps<'textarea'>> {
  /** Minimum height and type; `medium` (64px) by default. */
  size?: ControlSize
  /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
  variant?: ControlVariant
  /** Grow the textarea with its content instead of a fixed height. */
  autoResize?: boolean
}

function resizeToContent(element: HTMLTextAreaElement | null) {
  if (!element) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

/** A multiline `Field` control: inside a `Field` it takes the label, description, error, and invalid state. */
export function Textarea({
  size = 'medium',
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
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  const setRef = useCallback(
    (element: HTMLElement | null) => {
      const textarea = element instanceof HTMLTextAreaElement ? element : null
      textareaRef.current = textarea
      if (typeof ref === 'function') return ref(textarea)
      if (ref) ref.current = textarea
    },
    [ref]
  )

  // Measure on mount and whenever a controlled `value` changes, however it changed.
  React.useLayoutEffect(() => {
    if (autoResize) resizeToContent(textareaRef.current)
  }, [autoResize, value])

  // What the Field control owns: its id, name, value, disabled and autofocus state.
  const fieldProps = { id, name, value, defaultValue, disabled, autoFocus }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) resizeToContent(event.currentTarget)
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
