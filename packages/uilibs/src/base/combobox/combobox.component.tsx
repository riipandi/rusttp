/**
 * An input that suggests options as you type.
 *
 * @see: https://base-ui.com/react/components/combobox
 *
 * BaseUI Anatomy:
 * <Combobox.Root>
 *   <Combobox.Trigger>
 *     <Combobox.Value />
 *   </Combobox.Trigger>
 *   <Combobox.Portal>
 *     <Combobox.Backdrop />
 *     <Combobox.Positioner>
 *       <Combobox.Popup>
 *         <Combobox.Arrow />
 *         <Combobox.List>
 *           <Combobox.Item />
 *           <Combobox.Group>
 *             <Combobox.GroupLabel />
 *           </Combobox.Group>
 *         </Combobox.List>
 *       </Combobox.Popup>
 *     </Combobox.Positioner>
 *   </Combobox.Portal>
 * </Combobox.Root>
 */

import {
  Combobox as BaseCombobox,
  Combobox as BaseComboboxNamespace
} from '@base-ui/react/combobox'
import { Check, ChevronDown, X } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { shadow } from '../../styles/colors.stylex'
import { type ControlSize, controlBase, controlSizes } from '../../styles/control.stylex'
import { popupFx } from '../../styles/popup.stylex'
import { focusRing } from '../../styles/utils.stylex'
import { ring } from '../../styles/utils.stylex'
import { comboboxChipsSizes, comboboxStyles as s } from './combobox.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export const Combobox = BaseCombobox.Root
export const ComboboxValue = BaseCombobox.Value
export const ComboboxCollection = BaseCombobox.Collection
export const comboboxCreateItems = BaseComboboxNamespace.createItems

function TriggerChevron() {
  return <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
}

// Select-like trigger button — anchors the popup when the input lives inside
// ComboboxContent instead of the default input+trigger row (see ComboboxInput
// `showTrigger`). Inside a `Field` the `FieldLabel` names it; on its own, give it
// an `aria-label`, since the value or placeholder is its only text.
export function ComboboxTrigger({
  size = 'md',
  style,
  children,
  showChevron = true,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Trigger>, 'className' | 'style'> &
  StyleProp & {
    /** Control height and type; `md` (36px) by default. */
    size?: ControlSize
    /** Render the chevron icon. Set `false` for icon-only triggers (e.g. the
     * InputPhone country flag). Defaults to `true`. */
    showChevron?: boolean
  }) {
  return (
    <BaseCombobox.Trigger
      {...props}
      {...stylex.props(controlBase.root, controlSizes[size], s.trigger, style)}
    >
      {children}
      {showChevron ? (
        <BaseCombobox.Icon {...stylex.props(s.triggerIcon)}>
          <TriggerChevron />
        </BaseCombobox.Icon>
      ) : null}
    </BaseCombobox.Trigger>
  )
}

export interface ComboboxInputLabels {
  /** Name of the clear button. Defaults to `Clear value`. */
  clear: string
  /** Name of the dropdown trigger button. Defaults to `Open list`. */
  open: string
}

/**
 * Input with a dropdown trigger and an optional clear button. Inside a `Field` the `FieldLabel`
 * names it; on its own, give it an `aria-label`: a placeholder is not a name.
 */
export function ComboboxInput({
  size = 'md',
  style,
  inputStyle,
  showTrigger = true,
  showClear = false,
  labels,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Input>, 'className' | 'style' | 'size'> &
  StyleProp & {
    /** Control height and type; `md` (36px) by default. */
    size?: ControlSize
    /** Accessible names of the built-in buttons. */
    labels?: Partial<ComboboxInputLabels>
    /** Style applied directly to the inner input element. */
    inputStyle?: stylex.StyleXStyles
    /** Render the built-in dropdown trigger button. Set `false` when the
     * input is placed inside `ComboboxContent` and a `ComboboxTrigger`
     * elsewhere anchors the popup. */
    showTrigger?: boolean
    /** Render a clear button (`BaseCombobox.Clear`) before the trigger. */
    showClear?: boolean
  }) {
  return (
    <div {...stylex.props(s.inputWrap, style)}>
      <BaseCombobox.Input
        {...props}
        {...stylex.props(
          controlBase.root,
          controlSizes[size],
          s.input,
          showTrigger && showClear
            ? s.inputPaddingButtons2
            : (showTrigger || showClear) && s.inputPaddingButtons1,
          inputStyle
        )}
      />
      {showClear && (
        <BaseCombobox.Clear
          aria-label={labels?.clear ?? 'Clear value'}
          tabIndex={-1}
          {...stylex.props(
            focusRing.root,
            s.iconButton,
            showTrigger ? s.inputClearWithTrigger : s.inputClearAlone
          )}
        >
          <X size={16} strokeWidth={1.5} aria-hidden />
        </BaseCombobox.Clear>
      )}
      {showTrigger && (
        <BaseCombobox.Trigger
          aria-label={labels?.open ?? 'Open list'}
          tabIndex={-1}
          {...stylex.props(focusRing.root, s.iconButton, s.inputTrigger)}
        >
          <TriggerChevron />
        </BaseCombobox.Trigger>
      )}
    </div>
  )
}

// Container for chips in a multi-select combobox — also serves as the popup
// anchor (pass a ref to `ComboboxContent`'s `anchor`), so it forwards `ref`.
export function ComboboxChips({
  size = 'md',
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Chips>, 'className' | 'style'> &
  StyleProp & {
    /** Minimum height and type; `md` (36px) by default. */
    size?: ControlSize
  }) {
  return (
    <BaseCombobox.Chips
      {...props}
      {...stylex.props(
        controlBase.root,
        controlBase.within,
        comboboxChipsSizes[size],
        s.chips,
        style
      )}
    />
  )
}

export function ComboboxChip({
  style,
  children,
  removeLabel,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Chip>, 'className' | 'style'> &
  StyleProp & {
    /** Accessible name of the remove button. Defaults to `Remove <chip text>` for a text chip, else `Remove`. */
    removeLabel?: string
  }) {
  return (
    <BaseCombobox.Chip {...props} {...stylex.props(s.chip, style)}>
      {children}
      <BaseCombobox.ChipRemove
        aria-label={removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')}
        {...stylex.props(focusRing.root, s.chipRemove)}
      >
        <X size={10} strokeWidth={1.5} aria-hidden />
      </BaseCombobox.ChipRemove>
    </BaseCombobox.Chip>
  )
}

// Inline input rendered inside `ComboboxChips` — no border/background of its
// own, since the chips container already provides them.
export function ComboboxChipsInput({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Input>, 'className' | 'style'> & StyleProp) {
  return <BaseCombobox.Input {...props} {...stylex.props(s.chipsInput, style)} />
}

export interface ComboboxContentProps
  extends
    Omit<React.ComponentProps<typeof BaseCombobox.Popup>, 'className' | 'style'>,
    Pick<
      React.ComponentProps<typeof BaseCombobox.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset' | 'anchor' | 'collisionAvoidance'
    >,
    StyleProp {}

export function ComboboxContent({
  style,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  collisionAvoidance,
  ...props
}: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        anchor={anchor}
        collisionAvoidance={collisionAvoidance}
        {...stylex.props(popupFx.positioner)}
      >
        <BaseCombobox.Popup
          {...props}
          {...stylex.props(
            popupFx.shift,
            popupFx.fade,
            popupFx.pose,
            s.popup,
            ring({ shadow: shadow.raised }),
            style
          )}
        />
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  )
}

export function ComboboxList({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.List>, 'className' | 'style'> & StyleProp) {
  return <BaseCombobox.List {...props} {...stylex.props(s.list, style)} />
}

export function ComboboxItem({
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Item>, 'className' | 'style'> & StyleProp) {
  return (
    <BaseCombobox.Item {...props} {...stylex.props(s.item, style)}>
      {children}
      <BaseCombobox.ItemIndicator render={<span {...stylex.props(s.indicator)} />}>
        <Check size={16} strokeWidth={1.5} aria-hidden />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  )
}

export function ComboboxGroup({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Group>, 'className' | 'style'> & StyleProp) {
  return <BaseCombobox.Group {...props} {...stylex.props(style)} />
}

export function ComboboxLabel({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.GroupLabel>, 'className' | 'style'> & StyleProp) {
  return <BaseCombobox.GroupLabel {...props} {...stylex.props(s.label, style)} />
}

export function ComboboxEmpty({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Empty>, 'className' | 'style'> & StyleProp) {
  return <BaseCombobox.Empty {...props} {...stylex.props(s.empty, style)} />
}

export function ComboboxSeparator({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseCombobox.Separator>, 'className' | 'style'> & StyleProp) {
  return <BaseCombobox.Separator {...props} {...stylex.props(s.separator, style)} />
}
