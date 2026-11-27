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
import { Minus } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {
  type ControlVariant,
  controlBase,
  controlSizes,
  controlVariants
} from '../../styles/control.stylex'
import { glyphSize } from '../../styles/glyph'
import type { ControlSize, PartProps } from '../../styles/types'
import { otpFieldSlotSizes, otpFieldStyles as s } from './otp-field.stylex'

export interface OTPFieldLabels {
  /** Name of a slot after the first, which takes the field's own label. Defaults to `Character n of N`. */
  slot: (position: number, length: number) => string
}

const defaultLabels: OTPFieldLabels = {
  slot: (position, length) => `Character ${position} of ${length}`
}

interface OTPFieldContextValue {
  size: ControlSize
  variant: ControlVariant
  length: number
  /** Id of the element that names the field, when the field is named by `aria-label`. */
  labelId: string | undefined
  labels: OTPFieldLabels
}

/** What the root shares with its slots. */
const OTPFieldContext = React.createContext<OTPFieldContextValue>({
  size: 'medium',
  variant: 'outline',
  length: 0,
  labelId: undefined,
  labels: defaultLabels
})

/**
 * Base UI names the first slot from the root's label (a `Field.Label`, `aria-labelledby`, or a
 * `<label>`) and ignores an `aria-label` on it, so an `aria-label` on the root is turned into a
 * hidden element the first slot can point at. The other slots are named `Character n of N`.
 */
export function OTPField({
  size = 'medium',
  variant = 'outline',
  style,
  labels,
  length,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: PartProps<React.ComponentProps<typeof BaseOTPField.Root>, 'size'> & {
  /** Slot height and type; `medium` (36px) by default. */
  size?: ControlSize
  /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
  variant?: ControlVariant
  /** Accessible names of the slots; English by default. */
  labels?: Partial<OTPFieldLabels>
}) {
  const generatedId = React.useId()
  const labelId = ariaLabel != null && ariaLabelledBy == null ? generatedId : ariaLabelledBy
  const context = React.useMemo(
    () => ({ size, variant, length, labelId, labels: { ...defaultLabels, ...labels } }),
    [size, variant, length, labelId, labels]
  )

  return (
    <OTPFieldContext.Provider value={context}>
      <BaseOTPField.Root
        {...props}
        length={length}
        aria-labelledby={labelId}
        {...stylex.props(s.root, style)}
      >
        {ariaLabel != null && ariaLabelledBy == null ? (
          <span id={labelId} {...stylex.props(s.hiddenLabel)}>
            {ariaLabel}
          </span>
        ) : null}
        {children}
      </BaseOTPField.Root>
    </OTPFieldContext.Provider>
  )
}

export function OTPFieldGroup({ style, ...props }: PartProps<React.ComponentProps<'div'>>) {
  return <div {...props} {...stylex.props(s.group, style)} />
}

export function OTPFieldSlot({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseOTPField.Input>, 'render'>) {
  const { size, variant, length, labelId, labels } = React.useContext(OTPFieldContext)

  return (
    <BaseOTPField.Input
      {...props}
      // Base UI numbers the slots by their place in the document, on the server too.
      render={(inputProps, { index }) => (
        <input
          {...inputProps}
          {...(index === 0
            ? {
                'aria-labelledby':
                  props['aria-labelledby'] ?? labelId ?? inputProps['aria-labelledby']
              }
            : {
                'aria-label': props['aria-label'] ?? labels.slot(index + 1, length),
                'aria-labelledby': undefined
              })}
        />
      )}
      {...stylex.props(
        controlBase.root,
        controlSizes[size],
        controlVariants[variant],
        otpFieldSlotSizes[size],
        s.slot,
        style
      )}
    />
  )
}

export function OTPFieldSeparator({ style, ...props }: PartProps<React.ComponentProps<'div'>>) {
  return (
    <div role='separator' {...props} {...stylex.props(s.separator, style)}>
      <Minus size={glyphSize.medium} strokeWidth={1.5} aria-hidden />
    </div>
  )
}
