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
import {
  type ControlVariant,
  controlBase,
  controlSizes,
  controlVariants
} from '../../styles/control.stylex'
import { glyphSize, markSize } from '../../styles/glyph'
import { highlightedItem } from '../../styles/popup.stylex'
import type { ControlSize, Glyph } from '../../styles/types'
import type { StyleProp } from '../../styles/types'
import { buttonGroupMember, useButtonGroup } from '../button/button-group.context'
import { PopupShell, type PositionerProps } from '../popup-shell'
import { selectStyles as s } from './select.stylex'

export const Select = BaseSelect.Root
export const SelectValue = BaseSelect.Value
export const SelectGroup = BaseSelect.Group

/**
 * The button that opens the list. Inside a `Field` it is named by the `FieldLabel`; on its own it
 * shows only the value or placeholder, so give it an `aria-label` (or `aria-labelledby`).
 */
export function SelectTrigger({
  size: sizeProp,
  variant = 'outline',
  icon: Icon,
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseSelect.Trigger>, 'className' | 'style'> &
  StyleProp & {
    /** Control height and type; the `ButtonGroup`'s size, else `medium` (36px). */
    size?: ControlSize
    /** The box: `outline` (default), `faded`, `ghost`, or `headless`. */
    variant?: ControlVariant
    /** A glyph before the value; it is decoration, so the name still comes from the label. */
    icon?: Glyph
  }) {
  const group = useButtonGroup()
  const size = sizeProp ?? group?.size ?? 'medium'
  return (
    <BaseSelect.Trigger
      {...props}
      {...stylex.props(
        controlBase.root,
        controlSizes[size],
        controlVariants[variant],
        s.trigger,
        buttonGroupMember(group, false),
        style
      )}
    >
      {Icon ? (
        <span {...stylex.props(s.lead)}>
          <Icon size={glyphSize[size]} aria-hidden {...stylex.props(s.glyph)} />
          {children}
        </span>
      ) : (
        children
      )}
      <BaseSelect.Icon {...stylex.props(s.icon)}>
        <ChevronsUpDown size={glyphSize[size]} strokeWidth={1.5} aria-hidden />
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
        <ChevronUp size={markSize.medium} strokeWidth={2} aria-hidden />
      ) : (
        <ChevronDown size={markSize.medium} strokeWidth={2} aria-hidden />
      )}
    </Arrow>
  )
}

export interface SelectContentProps
  extends
    Omit<React.ComponentProps<typeof BaseSelect.Popup>, 'className' | 'style'>,
    PositionerProps,
    StyleProp {
  /** Lays the open list over its trigger so the selected item sits on the value. */
  alignItemWithTrigger?: boolean
}

export function SelectContent({
  style,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  collisionAvoidance,
  collisionPadding,
  anchor,
  alignItemWithTrigger = false,
  ...props
}: SelectContentProps) {
  return (
    <PopupShell
      parts={BaseSelect}
      positioner={{
        side,
        sideOffset,
        align,
        alignOffset,
        collisionAvoidance,
        collisionPadding,
        anchor,
        alignItemWithTrigger
      }}
      // The align-with-trigger overlay repositions on open; a scale-in animation fights that, so it
      // only fades out. Anchored mode gets the full closed pose on entry and exit.
      pose={!alignItemWithTrigger}
      // The edge is a ring, not a border: Base UI's align-item-with-trigger math ignores borders
      // and would shift the aligned text.
      popupStyle={[s.popup, !alignItemWithTrigger && s.popupAnchored]}
      style={style}
      {...props}
    >
      <ScrollArrow direction='up' />
      <BaseSelect.List {...stylex.props(s.list)}>{children}</BaseSelect.List>
      <ScrollArrow direction='down' />
    </PopupShell>
  )
}

export function SelectItem({
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseSelect.Item>, 'className' | 'style'> & StyleProp) {
  return (
    <BaseSelect.Item {...props} {...stylex.props(highlightedItem.root, s.item, style)}>
      <BaseSelect.ItemText {...stylex.props(s.itemText)}>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator {...stylex.props(s.itemIndicator)}>
        <Check size={markSize.medium} strokeWidth={2} aria-hidden />
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
