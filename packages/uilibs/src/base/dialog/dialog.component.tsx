/**
 * A popup that opens on top of the entire page.
 *
 * @see: https://base-ui.com/react/components/dialog
 *
 * BaseUI Anatomy:
 * <Dialog.Root>
 *   <Dialog.Trigger />
 *   <Dialog.Portal>
 *     <Dialog.Backdrop />
 *     <Dialog.Viewport>
 *       <Dialog.Popup>
 *         <Dialog.Title />
 *         <Dialog.Description />
 *         <Dialog.Close />
 *       </Dialog.Popup>
 *     </Dialog.Viewport>
 *   </Dialog.Portal>
 * </Dialog.Root>
 */

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { shadow } from '../../styles/colors.stylex'
import { popupFx } from '../../styles/popup.stylex'
import { type } from '../../styles/type.stylex'
import type { StyleProp } from '../../styles/types'
import { ring } from '../../styles/utils.stylex'
import { usePortalContainer } from '../../theme/theme-scope.context'
import { type CloseLabels, CloseButton } from './close-button'
import { dialogStyles as s } from './dialog.stylex'

export const Dialog = BaseDialog.Root
export const DialogTrigger = BaseDialog.Trigger
export const DialogPortal = BaseDialog.Portal
export const DialogClose = BaseDialog.Close

export function DialogOverlay({
  blurredOverlay = false,
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Backdrop>, 'className' | 'style'> &
  StyleProp & {
    /** Blurs the page behind the backdrop. */
    blurredOverlay?: boolean
  }) {
  return (
    <BaseDialog.Backdrop
      {...props}
      {...stylex.props(popupFx.scrim, s.overlay, blurredOverlay && popupFx.scrimBlurred, style)}
    />
  )
}

export function DialogContent({
  size = 'medium',
  blurredOverlay = false,
  style,
  children,
  showCloseButton = true,
  labels,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Popup>, 'className' | 'style'> &
  StyleProp & {
    /** Width: `medium` (default, 32rem) or the narrower `small` (24rem). */
    size?: 'small' | 'medium'
    /** Blurs the page behind the backdrop. */
    blurredOverlay?: boolean
    showCloseButton?: boolean
    /** Accessible names of the built-in close button; English by default. */
    labels?: Partial<CloseLabels>
  }) {
  return (
    <BaseDialog.Portal container={usePortalContainer()}>
      <DialogOverlay blurredOverlay={blurredOverlay} />
      <BaseDialog.Popup
        {...props}
        {...stylex.props(
          stylex.defaultMarker(),
          s.content,
          size === 'small' && s.contentSmall,
          ring({ shadow: shadow.overlay }),
          style
        )}
      >
        {children}
        {showCloseButton && (
          <BaseDialog.Close render={<CloseButton labels={labels} style={s.close} />} />
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function DialogHeader({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function DialogFooter({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.footer, style)} />
}

export function DialogTitle({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Title>, 'className' | 'style'> & StyleProp) {
  return <BaseDialog.Title {...props} {...stylex.props(type.body1, s.title, style)} />
}

export function DialogDescription({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Description>, 'className' | 'style'> & StyleProp) {
  return <BaseDialog.Description {...props} {...stylex.props(s.description, style)} />
}
