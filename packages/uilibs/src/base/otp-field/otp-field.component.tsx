/**
 * A one-time password input composed of individual character slots.
 *
 * @see: https://base-ui.com/react/components/otp-field
 *
 * BaseUI Anatomy:
 * <OTPField.Root>
 *   <OTPField.Input />
 *   <OTPField.Separator />
 * </OTPField.Root>
 */

import { OTPField as BaseOTPField } from '@base-ui/react/otp-field'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { type ControlSize, controlBase, controlSizes } from '../../styles/control.stylex'
import { otpFieldSlotSizes, otpFieldStyles as s } from './otp-field.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

/** The root's `size`, read by its slots. */
const OTPFieldSizeContext = React.createContext<ControlSize>('md')

export function OTPField({
  size = 'md',
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseOTPField.Root>, 'className' | 'style' | 'size'> &
  StyleProp & {
    /** Slot height and type; `md` (36px) by default. */
    size?: ControlSize
  }) {
  return (
    <OTPFieldSizeContext.Provider value={size}>
      <BaseOTPField.Root {...props} {...stylex.props(s.root, style)} />
    </OTPFieldSizeContext.Provider>
  )
}

export function OTPFieldGroup({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.group, style)} />
}

export function OTPFieldSlot({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseOTPField.Input>, 'className' | 'style'> & StyleProp) {
  const size = React.useContext(OTPFieldSizeContext)
  return (
    <BaseOTPField.Input
      {...props}
      {...stylex.props(
        controlBase.root,
        controlSizes[size],
        otpFieldSlotSizes[size],
        s.slot,
        style
      )}
    />
  )
}

export function OTPFieldSeparator({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return (
    <div role='separator' {...props} {...stylex.props(s.separator, style)}>
      <svg
        width='16'
        height='16'
        viewBox={`0 0 16 16`}
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        aria-hidden
      >
        <path d={`M4 8h8`} />
      </svg>
    </div>
  )
}
