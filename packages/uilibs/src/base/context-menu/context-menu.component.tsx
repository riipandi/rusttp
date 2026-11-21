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
import { shadow } from '../../styles/colors.stylex'
import { popupFx } from '../../styles/popup.stylex'
import { ring } from '../../styles/utils.stylex'
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
import { contextMenuStyles as s } from './context-menu.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

export const ContextMenu = BaseContextMenu.Root
export const ContextMenuGroup = BaseContextMenu.Group
export const ContextMenuPortal = BaseContextMenu.Portal
export const ContextMenuSub = BaseContextMenu.SubmenuRoot
export const ContextMenuRadioGroup = BaseContextMenu.RadioGroup

export function ContextMenuTrigger({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseContextMenu.Trigger>, 'className' | 'style'> & StyleProp) {
  return <BaseContextMenu.Trigger {...props} {...stylex.props(s.trigger, style)} />
}

export interface ContextMenuContentProps
  extends
    Omit<React.ComponentProps<typeof BaseContextMenu.Popup>, 'className' | 'style'>,
    Pick<
      React.ComponentProps<typeof BaseContextMenu.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    >,
    StyleProp {}

export function ContextMenuContent({
  style,
  side = 'right',
  sideOffset = 0,
  align = 'start',
  alignOffset = 4,
  ...props
}: ContextMenuContentProps) {
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(popupFx.positioner)}
      >
        <BaseContextMenu.Popup
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
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
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
      side='right'
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      {...props}
      style={[s.subPopup, style]}
    />
  )
}
