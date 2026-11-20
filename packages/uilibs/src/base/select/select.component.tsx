/**
 * Displays a list of options for the user to choose from.
 *
 * @see: https://base-ui.com/react/components/select
 *
 * BaseUI Anatomy:
 * <Select.Root>
 *   <Select.Trigger>
 *     <Select.Value />
 *     <Select.Icon />
 *   </Select.Trigger>
 *   <Select.Portal>
 *     <Select.Backdrop />
 *     <Select.Positioner>
 *       <Select.ScrollUpArrow />
 *       <Select.Popup>
 *         <Select.Arrow />
 *         <Select.List>
 *           <Select.Item>
 *             <Select.ItemText />
 *             <Select.ItemIndicator />
 *           </Select.Item>
 *           <Select.Separator />
 *           <Select.Group>
 *             <Select.GroupLabel />
 *           </Select.Group>
 *         </Select.List>
 *       </Select.Popup>
 *       <Select.ScrollDownArrow />
 *     </Select.Positioner>
 *   </Select.Portal>
 * </Select.Root>
 */

import { Select as BaseSelect } from '@base-ui/react/select'
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { shadow } from '../../styles/colors.stylex'
import { type ControlSize, controlBase, controlSizes } from '../../styles/control.stylex'
import { popupFx } from '../../styles/popup.stylex'
import { ring } from '../../styles/utils.stylex'
import { selectStyles as s } from './select.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export const Select = BaseSelect.Root
export const SelectValue = BaseSelect.Value
export const SelectGroup = BaseSelect.Group

/**
 * The button that opens the list. Inside a `Field` it is named by the `FieldLabel`; on its own it
 * shows only the value or placeholder, so give it an `aria-label` (or `aria-labelledby`).
 */
export function SelectTrigger({
  size = 'md',
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseSelect.Trigger>, 'className' | 'style'> &
  StyleProp & {
    /** Control height and type; `md` (36px) by default. */
    size?: ControlSize
  }) {
  return (
    <BaseSelect.Trigger
      {...props}
      {...stylex.props(controlBase.root, controlSizes[size], s.trigger, style)}
    >
      {children}
      <BaseSelect.Icon {...stylex.props(s.icon)}>
        <ChevronsUpDown size={16} strokeWidth={1.5} aria-hidden />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  )
}

function ScrollArrow({ direction }: { direction: 'up' | 'down' }) {
  const Arrow = direction === 'up' ? BaseSelect.ScrollUpArrow : BaseSelect.ScrollDownArrow
  return (
    <Arrow
      {...stylex.props(s.scrollArrow, direction === 'up' ? s.scrollArrowUp : s.scrollArrowDown)}
    >
      {direction === 'up' ? (
        <ChevronUp size={12} strokeWidth={2} aria-hidden />
      ) : (
        <ChevronDown size={12} strokeWidth={2} aria-hidden />
      )}
    </Arrow>
  )
}

export interface SelectContentProps
  extends
    Omit<React.ComponentProps<typeof BaseSelect.Popup>, 'className' | 'style'>,
    Pick<
      React.ComponentProps<typeof BaseSelect.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
    >,
    StyleProp {}

export function SelectContent({
  style,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(popupFx.positioner)}
      >
        <BaseSelect.Popup
          {...props}
          {...stylex.props(
            popupFx.shift,
            popupFx.fade,
            s.popup,
            // Edge as a ring, not a border: Base UI's align-item-with-trigger
            // math ignores borders and would shift the aligned text.
            ring({ shadow: shadow.raised }),
            // The align-with-trigger overlay repositions on open; a scale-in
            // animation fights that, so it only fades out. Anchored mode gets
            // the full closed pose on entry and exit.
            !alignItemWithTrigger && popupFx.pose,
            !alignItemWithTrigger && s.popupAnchored,
            style
          )}
        >
          <ScrollArrow direction='up' />
          <BaseSelect.List {...stylex.props(s.list)}>{children}</BaseSelect.List>
          <ScrollArrow direction='down' />
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  )
}

export function SelectItem({
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseSelect.Item>, 'className' | 'style'> & StyleProp) {
  return (
    <BaseSelect.Item {...props} {...stylex.props(s.item, style)}>
      <BaseSelect.ItemText {...stylex.props(s.itemText)}>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator {...stylex.props(s.itemIndicator)}>
        <Check size={12} strokeWidth={2} aria-hidden />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  )
}

export function SelectLabel({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseSelect.GroupLabel>, 'className' | 'style'> & StyleProp) {
  return <BaseSelect.GroupLabel {...props} {...stylex.props(s.label, style)} />
}

export function SelectSeparator({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseSelect.Separator>, 'className' | 'style'> & StyleProp) {
  return <BaseSelect.Separator {...props} {...stylex.props(s.separator, style)} />
}
