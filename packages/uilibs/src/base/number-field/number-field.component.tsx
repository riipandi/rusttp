/**
 * A numeric input element with increment and decrement buttons, and a scrub area.
 *
 * @see: https://base-ui.com/react/components/number-field
 *
 * BaseUI Anatomy:
 * <NumberField.Root>
 *   <NumberField.ScrubArea>
 *     <NumberField.ScrubAreaCursor />
 *   </NumberField.ScrubArea>
 *   <NumberField.Group>
 *     <NumberField.Decrement />
 *     <NumberField.Input />
 *     <NumberField.Increment />
 *   </NumberField.Group>
 * </NumberField.Root>
 */

import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import {
  ChevronDown,
  ChevronUp as ChevronUpIcon,
  Minus,
  Plus as PlusIcon
} from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {
  type ControlVariant,
  controlBase,
  controlSizes,
  controlVariantsWithin
} from '../../styles/control.stylex'
import { glyphSize } from '../../styles/glyph'
import type { ControlSize } from '../../styles/types'
import type { StyleProp } from '../../styles/types'
import { numberFieldButtonSizes, numberFieldStyles as s } from './number-field.stylex'

/** Button placement style of the default group. */
export type NumberFieldControls = 'stacked' | 'sides'

export const NumberFieldScrubArea = BaseNumberField.ScrubArea
export const NumberFieldScrubAreaCursor = BaseNumberField.ScrubAreaCursor

/** The root's `size`, read by the group and its steppers. */
const NumberFieldSizeContext = React.createContext<ControlSize>('md')
const NumberFieldVariantContext = React.createContext<ControlVariant>('outline')

export function NumberField({
  size = 'md',
  variant = 'outline',
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseNumberField.Root>, 'className' | 'style' | 'size'> &
  StyleProp & {
    /** Control height and type; `md` (36px) by default. */
    size?: ControlSize
    /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
    variant?: ControlVariant
  }) {
  return (
    <NumberFieldSizeContext.Provider value={size}>
      <NumberFieldVariantContext.Provider value={variant}>
        <BaseNumberField.Root {...props} {...stylex.props(s.root, style)} />
      </NumberFieldVariantContext.Provider>
    </NumberFieldSizeContext.Provider>
  )
}

export interface NumberFieldLabels {
  /** Name of the increment stepper. Defaults to `Increase`. */
  increase: string
  /** Name of the decrement stepper. Defaults to `Decrease`. */
  decrease: string
}

export function NumberFieldGroup({
  style,
  children,
  controls = 'stacked',
  labels,
  ...props
}: Omit<React.ComponentProps<typeof BaseNumberField.Group>, 'className' | 'style'> &
  StyleProp & {
    controls?: NumberFieldControls
    /** Accessible names of the built-in steppers. */
    labels?: Partial<NumberFieldLabels>
  }) {
  const size = React.useContext(NumberFieldSizeContext)
  const variant = React.useContext(NumberFieldVariantContext)
  const increase = labels?.increase ?? 'Increase'
  const decrease = labels?.decrease ?? 'Decrease'

  return (
    <BaseNumberField.Group
      {...props}
      {...stylex.props(
        controlBase.root,
        controlBase.within,
        controlVariantsWithin[variant],
        controlSizes[size],
        s.group,
        style
      )}
    >
      {children ?? (
        <>
          {controls === 'stacked' ? (
            <>
              <NumberFieldInput />
              <span {...stylex.props(s.controls)}>
                <NumberFieldIncrement controls='stacked' aria-label={increase} />
                <NumberFieldDecrement controls='stacked' aria-label={decrease} />
              </span>
            </>
          ) : (
            <>
              <NumberFieldDecrement aria-label={decrease} />
              <NumberFieldInput />
              <NumberFieldIncrement aria-label={increase} />
            </>
          )}
        </>
      )}
    </BaseNumberField.Group>
  )
}

export function NumberFieldInput({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseNumberField.Input>, 'className' | 'style'> & StyleProp) {
  return <BaseNumberField.Input {...props} {...stylex.props(s.input, style)} />
}

export function NumberFieldDecrement({
  style,
  children,
  icon,
  controls = 'sides',
  ...props
}: Omit<React.ComponentProps<typeof BaseNumberField.Decrement>, 'className' | 'style'> &
  StyleProp & {
    icon?: 'chevron-down' | 'minus'
    controls?: NumberFieldControls
  }) {
  const size = React.useContext(NumberFieldSizeContext)
  const stacked = controls === 'stacked'
  const preset = icon ?? (stacked ? 'chevron-down' : 'minus')
  const Icon = preset === 'chevron-down' ? ChevronDown : Minus

  return (
    <BaseNumberField.Decrement
      {...props}
      {...stylex.props(
        s.button,
        !stacked && numberFieldButtonSizes[size],
        stacked ? [s.controlStacked, s.controlStackedLast] : s.decrement,
        style
      )}
    >
      {children ?? <Icon size={glyphSize.md} strokeWidth={2} aria-hidden />}
    </BaseNumberField.Decrement>
  )
}

export function NumberFieldIncrement({
  style,
  children,
  icon,
  controls = 'sides',
  ...props
}: Omit<React.ComponentProps<typeof BaseNumberField.Increment>, 'className' | 'style'> &
  StyleProp & {
    icon?: 'chevron-up' | 'plus'
    controls?: NumberFieldControls
  }) {
  const size = React.useContext(NumberFieldSizeContext)
  const stacked = controls === 'stacked'
  const preset = icon ?? (stacked ? 'chevron-up' : 'plus')
  const Icon = preset === 'chevron-up' ? ChevronUpIcon : PlusIcon

  return (
    <BaseNumberField.Increment
      {...props}
      {...stylex.props(
        s.button,
        !stacked && numberFieldButtonSizes[size],
        stacked ? [s.controlStacked, s.controlStackedFirst] : s.increment,
        style
      )}
    >
      {children ?? <Icon size={glyphSize.md} strokeWidth={2} aria-hidden />}
    </BaseNumberField.Increment>
  )
}
