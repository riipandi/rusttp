/**
 * A menu bar component.
 *
 * @see: https://base-ui.com/react/components/menubar
 *
 * BaseUI Anatomy:
 * <Menubar.Root />
 */

import { Menubar as BaseMenubar } from '@base-ui/react/menubar'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { controlSizes } from '../../styles/control.stylex'
import type { ControlSize, PartProps } from '../../styles/types'
import { focusRing } from '../../styles/utils.stylex'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  type DropdownMenuContentProps
} from '../dropdown-menu'
import { menubarStyles as s } from './menubar.stylex'

export interface MenubarProps extends PartProps<React.ComponentProps<typeof BaseMenubar>> {
  /** Bar height and type, as the control scale; `medium` is 36px. */
  size?: ControlSize
}

export function Menubar({ size = 'medium', style, ...props }: MenubarProps) {
  return <BaseMenubar {...props} {...stylex.props(controlSizes[size], s.root, style)} />
}

export const MenubarMenu = DropdownMenu
export const MenubarGroup = DropdownMenuGroup
export const MenubarSub = DropdownMenuSub
export const MenubarRadioGroup = DropdownMenuRadioGroup
export const MenubarItem = DropdownMenuItem
export const MenubarCheckboxItem = DropdownMenuCheckboxItem
export const MenubarRadioItem = DropdownMenuRadioItem
export const MenubarLabel = DropdownMenuLabel
export const MenubarSeparator = DropdownMenuSeparator
export const MenubarShortcut = DropdownMenuShortcut
export const MenubarSubTrigger = DropdownMenuSubTrigger
export const MenubarSubContent = DropdownMenuSubContent

export function MenubarTrigger({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof DropdownMenuTrigger>>) {
  return <DropdownMenuTrigger {...props} {...stylex.props(focusRing.root, s.trigger, style)} />
}

export function MenubarContent({
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  style,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      {...props}
      style={[s.content, style]}
    />
  )
}
