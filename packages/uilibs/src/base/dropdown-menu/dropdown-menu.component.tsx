/**
 * Displays a menu of options or commands.
 *
 * @see: https://base-ui.com/react/components/menu
 *
 * BaseUI Anatomy:
 * <Menu.Root>
 *   <Menu.Trigger />
 *   <Menu.Portal>
 *     <Menu.Backdrop />
 *     <Menu.Positioner>
 *       <Menu.Popup>
 *         <Menu.Arrow />
 *         <Menu.Item />
 *         <Menu.Separator />
 *         <Menu.Group>
 *           <Menu.GroupLabel />
 *         </Menu.Group>
 *         <Menu.RadioGroup>
 *           <Menu.RadioItem />
 *         </Menu.RadioGroup>
 *         <Menu.CheckboxItem />
 *         <Menu.SubmenuRoot>
 *           <Menu.SubmenuTrigger />
 *         </Menu.SubmenuRoot>
 *       </Menu.Popup>
 *     </Menu.Positioner>
 *   </Menu.Portal>
 * </Menu.Root>
 */

import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Check, ChevronRight } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { glyphSize } from '../../styles/glyph'
import { highlightedItem, popupList } from '../../styles/popup.stylex'
import type { ColorRole, Glyph, PartProps } from '../../styles/types'
import { mirrorInRtl } from '../../styles/utils.stylex'
import { PopupShell, type PositionerProps } from '../popup-shell'
import { dropdownMenuStyles as s } from './dropdown-menu.stylex'

export const DropdownMenu = BaseMenu.Root
export const DropdownMenuTrigger = BaseMenu.Trigger
export const DropdownMenuGroup = BaseMenu.Group
export const DropdownMenuSub = BaseMenu.SubmenuRoot
export const DropdownMenuRadioGroup = BaseMenu.RadioGroup

export interface DropdownMenuContentProps
  extends PartProps<React.ComponentProps<typeof BaseMenu.Popup>>, PositionerProps {}

export function DropdownMenuContent({
  style,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  collisionAvoidance,
  collisionPadding,
  anchor,
  ...props
}: DropdownMenuContentProps) {
  return (
    <PopupShell
      parts={BaseMenu}
      positioner={{
        side,
        sideOffset,
        align,
        alignOffset,
        collisionAvoidance,
        collisionPadding,
        anchor
      }}
      popupStyle={s.popup}
      style={style}
      {...props}
    />
  )
}

export interface DropdownMenuItemProps extends PartProps<
  React.ComponentProps<typeof BaseMenu.Item>,
  'color'
> {
  /** `critical` marks a destructive or irreversible item; `primary` a recommended one. */
  color?: Extract<ColorRole, 'neutral' | 'critical' | 'primary'>
  /** A glyph before the label; it is decoration, so the item's name is still its label. */
  icon?: Glyph
  /** Indents the item to align with checkbox/radio item labels. */
  inset?: boolean
}

export function DropdownMenuItem({
  style,
  color,
  icon: Icon,
  inset,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <BaseMenu.Item
      {...props}
      {...stylex.props(
        highlightedItem.root,
        s.item,
        inset && s.itemInset,
        color === 'critical' && s.itemCritical,
        color === 'primary' && s.itemPrimary,
        style
      )}
    >
      {Icon ? <Icon size={glyphSize.medium} aria-hidden {...stylex.props(s.itemIcon)} /> : null}
      {children}
    </BaseMenu.Item>
  )
}

function IndicatorCheck() {
  return <Check size={glyphSize.medium} strokeWidth={1.5} aria-hidden />
}

export function DropdownMenuCheckboxItem({
  style,
  children,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMenu.CheckboxItem>>) {
  return (
    <BaseMenu.CheckboxItem
      {...props}
      {...stylex.props(highlightedItem.root, s.item, s.indicatorItem, style)}
    >
      <span {...stylex.props(s.indicator)}>
        <BaseMenu.CheckboxItemIndicator>
          <IndicatorCheck />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      {children}
    </BaseMenu.CheckboxItem>
  )
}

export function DropdownMenuRadioItem({
  style,
  children,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMenu.RadioItem>>) {
  return (
    <BaseMenu.RadioItem
      {...props}
      {...stylex.props(highlightedItem.root, s.item, s.indicatorItem, style)}
    >
      <span {...stylex.props(s.indicator)}>
        <BaseMenu.RadioItemIndicator>
          <IndicatorCheck />
        </BaseMenu.RadioItemIndicator>
      </span>
      {children}
    </BaseMenu.RadioItem>
  )
}

export function DropdownMenuSubTrigger({
  style,
  inset,
  children,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMenu.SubmenuTrigger>> & { inset?: boolean }) {
  return (
    <BaseMenu.SubmenuTrigger
      {...props}
      {...stylex.props(highlightedItem.root, s.item, s.subTrigger, inset && s.itemInset, style)}
    >
      {children}
      <ChevronRight
        size={glyphSize.medium}
        strokeWidth={1.5}
        aria-hidden
        {...stylex.props(s.subTriggerChevron, mirrorInRtl.root)}
      />
    </BaseMenu.SubmenuTrigger>
  )
}

export function DropdownMenuSubContent({
  style,
  sideOffset = 0,
  alignOffset = -4,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      side='inline-end'
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      {...props}
      style={[s.subPopup, style]}
    />
  )
}

export function DropdownMenuShortcut({ style, ...props }: PartProps<React.ComponentProps<'span'>>) {
  return <span {...props} {...stylex.props(s.shortcut, style)} />
}

export function DropdownMenuSeparator({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMenu.Separator>>) {
  return <BaseMenu.Separator {...props} {...stylex.props(popupList.separator, style)} />
}

export function DropdownMenuLabel({
  style,
  inset,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMenu.GroupLabel>> & { inset?: boolean }) {
  return (
    <BaseMenu.GroupLabel
      {...props}
      {...stylex.props(popupList.label, inset && s.itemInset, style)}
    />
  )
}
