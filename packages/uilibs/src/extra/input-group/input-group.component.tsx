import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Button, type ButtonProps } from '../../base/button'
import {
  ButtonGroupContext,
  buttonGroupMember,
  useButtonGroup
} from '../../base/button/button-group.context'
import { Input } from '../../base/input'
import {
  type ControlVariant,
  controlBase,
  controlVariantsWithin
} from '../../styles/control.stylex'
import type { ControlSize } from '../../styles/types'
import type { StyleProp } from '../../styles/types'
import { Textarea } from '../textarea'
import { inputGroupStyles as s } from './input-group.stylex'
import { inputGroupAddonAligns as addonAligns } from './input-group.stylex'
import { inputGroupButtonSizes as buttonSizes } from './input-group.stylex'
import { inputGroupButtonSquare as buttonSquare } from './input-group.stylex'
import { inputGroupControlHeights as controlHeights } from './input-group.stylex'

/** The group's `size`, read by its input and textarea. */
const InputGroupSizeContext = React.createContext<ControlSize>('medium')

export function InputGroup({
  size: sizeProp,
  variant = 'outline',
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> &
  StyleProp & {
    /** Height and type of the input; the `ButtonGroup`'s size, else `medium` (36px). */
    size?: ControlSize
    /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
    variant?: ControlVariant
  }) {
  const group = useButtonGroup()
  const size = sizeProp ?? group?.size ?? 'medium'
  return (
    // The group is one member of a ButtonGroup; the Input and Buttons inside it are not.
    <ButtonGroupContext.Provider value={null}>
      <InputGroupSizeContext.Provider value={size}>
        <div
          role='group'
          {...props}
          {...stylex.props(
            controlBase.root,
            controlBase.within,
            controlVariantsWithin[variant],
            s.root,
            buttonGroupMember(group, false),
            style
          )}
        />
      </InputGroupSizeContext.Provider>
    </ButtonGroupContext.Provider>
  )
}

export type InputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end'

export function InputGroupAddon({
  align = 'inline-start',
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> &
  StyleProp & { align?: InputGroupAddonAlign }) {
  return (
    <div
      role='group'
      // Read by the group root's :has() to switch to a column layout for block-aligned addons.
      data-align={align}
      onClick={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest('button')) return
        event.currentTarget.parentElement?.querySelector<HTMLElement>('input, textarea')?.focus()
      }}
      {...props}
      {...stylex.props(s.addon, addonAligns[align], style)}
    />
  )
}

export type InputGroupButtonSize = 'xsmall' | 'small'

export function InputGroupButton({
  variant = 'ghost',
  size = 'xsmall',
  style,
  ...props
}: Omit<ButtonProps, 'size'> & {
  /** A box smaller than a Button of the same name: `xsmall` 24px, `small` 32px. No children make it a square. */
  size?: InputGroupButtonSize
}) {
  const square = React.Children.toArray(props.children).length === 0
  return (
    <Button
      type='button'
      variant={variant}
      {...props}
      style={[buttonSizes[size], square && buttonSquare[size], style]}
    />
  )
}

export function InputGroupText({
  style,
  ...props
}: Omit<React.ComponentProps<'span'>, 'className' | 'style'> & StyleProp) {
  return <span {...props} {...stylex.props(s.text, style)} />
}

export function InputGroupInput({ size, style, ...props }: React.ComponentProps<typeof Input>) {
  const groupSize = React.useContext(InputGroupSizeContext)
  const inputSize = size ?? groupSize
  return <Input {...props} size={inputSize} style={[s.control, controlHeights[inputSize], style]} />
}

export function InputGroupTextarea({
  size,
  style,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const groupSize = React.useContext(InputGroupSizeContext)
  return <Textarea {...props} size={size ?? groupSize} style={[s.control, s.textarea, style]} />
}
