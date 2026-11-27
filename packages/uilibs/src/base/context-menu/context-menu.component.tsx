/**
 * A menu that appears at the pointer on right click or long press.
 *
 * @see: https://base-ui.com/react/components/context-menu
 *
 * BaseUI Anatomy:
 * <ContextMenu.Root>
 *   <ContextMenu.Trigger />
 *   <ContextMenu.Portal>
 *     <ContextMenu.Backdrop />
 *     <ContextMenu.Positioner>
 *       <ContextMenu.Popup>
 *         <ContextMenu.Arrow />
 *         <ContextMenu.Item />
 *         <ContextMenu.Separator />
 *         <ContextMenu.Group>
 *           <ContextMenu.GroupLabel />
 *         </ContextMenu.Group>
 *         <ContextMenu.RadioGroup>
 *           <ContextMenu.RadioItem />
 *         </ContextMenu.RadioGroup>
 *         <ContextMenu.CheckboxItem />
 *         <ContextMenu.SubmenuRoot>
 *           <ContextMenu.SubmenuTrigger />
 *         </ContextMenu.SubmenuRoot>
 *       </ContextMenu.Popup>
 *     </ContextMenu.Positioner>
 *   </ContextMenu.Portal>
 * </ContextMenu.Root>
 */

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { PartProps } from '../../styles/types'
import {
  type DropdownMenuItemProps,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSubTrigger
} from '../dropdown-menu'
import { PopupShell, type PositionerProps } from '../popup-shell'
import { contextMenuStyles as s } from './context-menu.stylex'

export const ContextMenu = BaseContextMenu.Root
export const ContextMenuGroup = BaseContextMenu.Group
export const ContextMenuSub = BaseContextMenu.SubmenuRoot
export const ContextMenuRadioGroup = BaseContextMenu.RadioGroup

export function ContextMenuTrigger({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseContextMenu.Trigger>>) {
  return <BaseContextMenu.Trigger {...props} {...stylex.props(s.trigger, style)} />
}

export interface ContextMenuContentProps
  extends PartProps<React.ComponentProps<typeof BaseContextMenu.Popup>>, PositionerProps {}

export function ContextMenuContent({
  style,
  side = 'right',
  sideOffset = 0,
  align = 'start',
  alignOffset = 4,
  collisionAvoidance,
  collisionPadding,
  anchor,
  ...props
}: ContextMenuContentProps) {
  return (
    <PopupShell
      parts={BaseContextMenu}
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

// The item parts are Base UI's own Menu parts (`ContextMenu.Item` is `Menu.Item`), styled the same
// as a dropdown's, so they are the dropdown's.
export type ContextMenuItemProps = DropdownMenuItemProps
export const ContextMenuItem = DropdownMenuItem
export const ContextMenuCheckboxItem = DropdownMenuCheckboxItem
export const ContextMenuRadioItem = DropdownMenuRadioItem
export const ContextMenuSubTrigger = DropdownMenuSubTrigger
export const ContextMenuShortcut = DropdownMenuShortcut
export const ContextMenuSeparator = DropdownMenuSeparator
export const ContextMenuLabel = DropdownMenuLabel

export function ContextMenuSubContent({
  style,
  sideOffset = 0,
  alignOffset = -4,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuContent
      side='inline-end'
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      {...props}
      style={[s.subPopup, style]}
    />
  )
}
