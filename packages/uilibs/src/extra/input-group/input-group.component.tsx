import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Button, type ButtonProps } from '../../base/button'
import { Input } from '../../base/input'
import { type ControlSize, controlBase } from '../../styles/control.stylex'
import { Textarea } from '../textarea'
import { inputGroupStyles as s } from './input-group.stylex'
import { inputGroupAddonAligns as addonAligns } from './input-group.stylex'
import { inputGroupButtonSizes as buttonSizes } from './input-group.stylex'
import { inputGroupControlHeights as controlHeights } from './input-group.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

/** The group's `size`, read by its input and textarea. */
const InputGroupSizeContext = React.createContext<ControlSize>('md')

export function InputGroup({
  size = 'md',
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> &
  StyleProp & {
    /** Height and type of the input; `md` (36px) by default. */
    size?: ControlSize
  }) {
  return (
    <InputGroupSizeContext.Provider value={size}>
      <div
        role='group'
        {...props}
        {...stylex.props(controlBase.root, controlBase.within, s.root, style)}
      />
    </InputGroupSizeContext.Provider>
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

export type InputGroupButtonSize = 'xs' | 'iconXs' | 'iconSm'

export function InputGroupButton({
  variant = 'ghost',
  size = 'xs',
  style,
  ...props
}: Omit<ButtonProps, 'size'> & { size?: InputGroupButtonSize }) {
  return <Button type='button' variant={variant} {...props} style={[buttonSizes[size], style]} />
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
