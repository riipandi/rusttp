import { Field as BaseField } from '@base-ui/react/field'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { StyleProp } from '../../styles/types'
import { fileUploadStyles as styles } from './file-upload.stylex'

export interface FileUploadChangeArgs {
  name: string
  value: File[]
  event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
}

export interface FileUploadProps
  extends
    Omit<useRender.ComponentProps<'div'>, 'children' | 'className' | 'onChange' | 'style'>,
    StyleProp {
  /** Name of the input element */
  name: string
  /** Disable the file upload input */
  disabled?: boolean
  /** Node for inserting children, can be a render function that receives component state */
  children?: React.ReactNode | ((props: { highlighted?: boolean }) => React.ReactNode)
  /** Callback when the component value is changed */
  onChange?: (args: FileUploadChangeArgs) => void
  /** Component height, literal css value or px number */
  height?: string | number
  /** Headless variant is useful for rendering custom triggers like a Button */
  variant?: 'outline' | 'headless'
  /** Render inline making the component more compact */
  inline?: boolean
  /** Additional attributes for the input element */
  inputAttributes?: React.ComponentProps<'input'>
}

/** Whether `file` matches an `accept` list the way the native picker reads it: `.ext`, `type/*`, `type/subtype`. */
export function acceptsFile(file: File, accept: string | undefined) {
  const tokens = accept
    ?.split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (!tokens?.length) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return tokens.some((token) =>
    token.startsWith('.')
      ? name.endsWith(token)
      : token.endsWith('/*')
        ? type.startsWith(token.slice(0, -1))
        : type === token
  )
}

const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault()

/** A file input and drop area that is a `Field` control: inside a `Field` it takes the label, error, and invalid state. */
export function FileUpload({
  name,
  children,
  height,
  variant = 'outline',
  inline = false,
  disabled = false,
  onChange,
  inputAttributes,
  style,
  render,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  ...otherProps
}: FileUploadProps) {
  const [highlighted, setHighlighted] = React.useState(false)

  const handleDragEnter = () => {
    if (disabled) return
    setHighlighted(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // Ignore elements inside the field
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    setHighlighted(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (disabled) return
    setHighlighted(false)
    // A drop bypasses the input's own `accept` and `multiple`, so apply them here.
    const dropped = Array.from(event.dataTransfer.files).filter((file) =>
      acceptsFile(file, inputAttributes?.accept)
    )
    const files = inputAttributes?.multiple ? dropped : dropped.slice(0, 1)
    if (files.length > 0) onChange?.({ name, value: files, event })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.files
    if (!nextValue) return
    onChange?.({ name, value: Array.from(nextValue), event })
  }

  const inputNode = (
    <BaseField.Control
      {...inputAttributes}
      {...stylex.props(styles.input)}
      type='file'
      name={name}
      disabled={disabled}
      onChange={handleChange}
    />
  )

  const childrenNode = typeof children === 'function' ? children({ highlighted }) : children

  const layerClass = variant === 'outline' ? styles.outline : styles.headless

  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        ...stylex.props(
          styles.root,
          inline && styles.inline,
          highlighted && styles.highlighted,
          disabled && styles.disabled,
          height != null && styles.height(height),
          style
        ),
        onDragOver: handleDragOver,
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: (
          <label
            {...stylex.props(
              styles.layer,
              inline && styles.layerCompact,
              layerClass,
              highlighted && styles.highlighted,
              disabled && styles.disabled
            )}
          >
            {inputNode}
            <span {...stylex.props(styles.content)}>{childrenNode}</span>
          </label>
        )
      },
      otherProps,
      // `mergeProps` runs these once, before the handlers above; a disabled upload reports no drag.
      disabled ? undefined : { onDragOver, onDragEnter, onDragLeave, onDrop }
    )
  })
}

/**
 * Marks a nested element as the visually expected trigger. The whole
 * FileUpload area stays clickable through its label; this only keeps the
 * composition in the text flow.
 */
export function FileUploadTrigger({
  children,
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleProp) {
  return (
    <span {...props} {...stylex.props(styles.trigger, style)}>
      {children}
    </span>
  )
}
