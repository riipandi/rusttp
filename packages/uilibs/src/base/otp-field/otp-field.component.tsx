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
import { type ControlSize, controlBase, controlSizes } from '../../styles/control.stylex'
import { otpFieldSlotSizes, otpFieldStyles as s } from './otp-field.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export interface OTPFieldLabels {
  /** Name of a slot after the first, which takes the field's own label. Defaults to `Character n of N`. */
  slot: (position: number, length: number) => string
}

const defaultLabels: OTPFieldLabels = {
  slot: (position, length) => `Character ${position} of ${length}`
}

interface OTPFieldContextValue {
  size: ControlSize
  length: number
  /** Id of the element that names the field, when the field is named by `aria-label`. */
  labelId: string | undefined
  labels: OTPFieldLabels
}

/** What the root shares with its slots. */
const OTPFieldContext = React.createContext<OTPFieldContextValue>({
  size: 'md',
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
  size = 'md',
  style,
  labels,
  length,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: Omit<React.ComponentProps<typeof BaseOTPField.Root>, 'className' | 'style' | 'size'> &
  StyleProp & {
    /** Slot height and type; `md` (36px) by default. */
    size?: ControlSize
    /** Accessible names of the slots; English by default. */
    labels?: Partial<OTPFieldLabels>
  }) {
  const generatedId = React.useId()
  const labelId = ariaLabel != null && ariaLabelledBy == null ? generatedId : ariaLabelledBy
  const context = React.useMemo(
    () => ({ size, length, labelId, labels: { ...defaultLabels, ...labels } }),
    [size, length, labelId, labels]
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

export function OTPFieldGroup({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.group, style)} />
}

export function OTPFieldSlot({
  style,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof BaseOTPField.Input>, 'className' | 'style'> & StyleProp) {
  const { size, length, labelId, labels } = React.useContext(OTPFieldContext)
  const slotRef = React.useRef<HTMLInputElement | null>(null)
  // Base UI numbers the slots by registration order, which is their order in the document.
  const [position, setPosition] = React.useState(0)

  React.useLayoutEffect(() => {
    const slot = slotRef.current
    const slots = slot
      ?.closest('[role="group"]')
      ?.querySelectorAll('input:not([aria-hidden="true"])')
    setPosition(slot && slots ? Array.from(slots).indexOf(slot) + 1 : 0)
  })

  const setRef = React.useCallback(
    (element: HTMLInputElement | null) => {
      slotRef.current = element
      if (typeof ref === 'function') return ref(element)
      if (ref) ref.current = element
    },
    [ref]
  )

  const naming =
    position === 1
      ? { 'aria-labelledby': props['aria-labelledby'] ?? labelId }
      : position > 1
        ? { 'aria-label': props['aria-label'] ?? labels.slot(position, length) }
        : undefined

  return (
    <BaseOTPField.Input
      ref={setRef}
      {...props}
      {...naming}
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
      <Minus size={16} strokeWidth={1.5} aria-hidden />
    </div>
  )
}
