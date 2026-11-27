/**
 * Displays rich content in a portal.
 *
 * @see: https://base-ui.com/react/components/popover
 *
 * BaseUI Anatomy:
 * <Popover.Root>
 *   <Popover.Trigger />
 *   <Popover.Portal>
 *     <Popover.Backdrop />
 *     <Popover.Positioner>
 *       <Popover.Popup>
 *         <Popover.Arrow />
 *         <Popover.Viewport>
 *           <Popover.Title />
 *           <Popover.Description />
 *           <Popover.Close />
 *         </Popover.Viewport>
 *       </Popover.Popup>
 *     </Popover.Positioner>
 *   </Popover.Portal>
 * </Popover.Root>
 */

import { Popover as BasePopover } from '@base-ui/react/popover'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { type, descriptionText } from '../../styles/type.stylex'
import type { PartProps } from '../../styles/types'
import type { UnitStep } from '../../styles/utils.stylex'
import { PopupShell, type PositionerProps } from '../popup-shell'
import { popoverPadding, popoverRadii, popoverStyles as s } from './popover.stylex'

export const Popover = BasePopover.Root
export const PopoverTrigger = BasePopover.Trigger
export const PopoverClose = BasePopover.Close

export interface PopoverContentProps
  extends PartProps<React.ComponentProps<typeof BasePopover.Popup>>, PositionerProps {
  /** The `shadow` token the popup draws: `outline`, `raised` (default), or the deepest `overlay`. */
  elevation?: 'outline' | 'raised' | 'overlay'
  /** Space inside the popup, counted in `unit` steps (`4` is 16px, the default). */
  padding?: UnitStep
  /** Corner radius: `medium` (default) or `large`. */
  borderRadius?: 'medium' | 'large'
}

export function PopoverContent({
  elevation = 'raised',
  padding = 4,
  borderRadius = 'medium',
  style,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  collisionAvoidance,
  collisionPadding,
  anchor,
  ...props
}: PopoverContentProps) {
  return (
    <PopupShell
      parts={BasePopover}
      positioner={{
        side,
        sideOffset,
        align,
        alignOffset,
        collisionAvoidance,
        collisionPadding,
        anchor
      }}
      popupStyle={[s.popup, popoverPadding[padding], popoverRadii[borderRadius]]}
      elevation={elevation}
      style={style}
      {...props}
    />
  )
}

/** Layout wrapper for `PopoverTitle` + `PopoverDescription` inside `PopoverContent`. */
export function PopoverHeader({ style, ...props }: PartProps<React.ComponentProps<'div'>>) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function PopoverTitle({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BasePopover.Title>>) {
  return <BasePopover.Title {...props} {...stylex.props(s.title, style)} />
}

export function PopoverDescription({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BasePopover.Description>>) {
  return (
    <BasePopover.Description
      {...props}
      {...stylex.props(type.body2, descriptionText.root, style)}
    />
  )
}
