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
import { shadow } from '../../styles/colors.stylex'
import { popupFx } from '../../styles/popup.stylex'
import type { StyleProp } from '../../styles/types'
import { ring, type UnitStep } from '../../styles/utils.stylex'
import { popoverPadding, popoverRadii, popoverStyles as s } from './popover.stylex'

export const Popover = BasePopover.Root
export const PopoverTrigger = BasePopover.Trigger
export const PopoverClose = BasePopover.Close

export interface PopoverContentProps
  extends
    Omit<React.ComponentProps<typeof BasePopover.Popup>, 'className' | 'style'>,
    Pick<
      React.ComponentProps<typeof BasePopover.Positioner>,
      'align' | 'alignOffset' | 'collisionAvoidance' | 'collisionPadding' | 'side' | 'sideOffset'
    > {
  /** Depth of the shadow: `overlay` (default) or the lighter `raised`. */
  elevation?: 'overlay' | 'raised'
  /** Space inside the popup, counted in `unit` steps (`4` is 16px, the default). */
  padding?: UnitStep
  /** Corner radius: `medium` (default) or `large`. */
  borderRadius?: 'medium' | 'large'
  style?: stylex.StyleXStyles
}

export function PopoverContent({
  elevation = 'overlay',
  padding = 4,
  borderRadius = 'medium',
  style,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  collisionAvoidance,
  collisionPadding,
  ...props
}: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionAvoidance={collisionAvoidance}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(popupFx.positioner)}
      >
        <BasePopover.Popup
          {...props}
          {...stylex.props(
            popupFx.shift,
            popupFx.fade,
            popupFx.pose,
            s.popup,
            popoverPadding[padding],
            popoverRadii[borderRadius],
            ring({ shadow: elevation === 'raised' ? shadow.outline : shadow.raised }),
            style
          )}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

/** Layout wrapper for `PopoverTitle` + `PopoverDescription` inside `PopoverContent`. */
export function PopoverHeader({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function PopoverTitle({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BasePopover.Title>, 'className' | 'style'> & StyleProp) {
  return <BasePopover.Title {...props} {...stylex.props(s.title, style)} />
}

export function PopoverDescription({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BasePopover.Description>, 'className' | 'style'> & StyleProp) {
  return <BasePopover.Description {...props} {...stylex.props(s.description, style)} />
}
