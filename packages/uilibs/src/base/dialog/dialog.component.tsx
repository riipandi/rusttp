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
import { ring } from '../../styles/utils.stylex'
import { type CloseLabels, CloseButton } from './close-button'
import { dialogStyles as s } from './dialog.stylex'

interface StyleXStyleProps {
  style?: stylex.StyleXStyles
}

export const Dialog = BaseDialog.Root
export const DialogTrigger = BaseDialog.Trigger
export const DialogPortal = BaseDialog.Portal
export const DialogClose = BaseDialog.Close

export function DialogOverlay({
  blurredOverlay = false,
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Backdrop>, 'className' | 'style'> &
  StyleXStyleProps & {
    /** Blurs the page behind the backdrop. */
    blurredOverlay?: boolean
  }) {
  return (
    <BaseDialog.Backdrop
      {...props}
      {...stylex.props(s.overlay, blurredOverlay && s.overlayBlurred, style)}
    />
  )
}

export function DialogContent({
  size = 'md',
  blurredOverlay = false,
  style,
  children,
  showCloseButton = true,
  labels,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Popup>, 'className' | 'style'> &
  StyleXStyleProps & {
    /** Width: `md` (default, 32rem) or the narrower `sm` (24rem). */
    size?: 'sm' | 'md'
    /** Blurs the page behind the backdrop. */
    blurredOverlay?: boolean
    showCloseButton?: boolean
    /** Accessible names of the built-in close button; English by default. */
    labels?: Partial<CloseLabels>
  }) {
  return (
    <BaseDialog.Portal>
      <DialogOverlay blurredOverlay={blurredOverlay} />
      <BaseDialog.Popup
        {...props}
        {...stylex.props(
          stylex.defaultMarker(),
          s.content,
          size === 'sm' && s.contentSmall,
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
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleXStyleProps) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function DialogFooter({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleXStyleProps) {
  return <div {...props} {...stylex.props(s.footer, style)} />
}

export function DialogTitle({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Title>, 'className' | 'style'> & StyleXStyleProps) {
  return <BaseDialog.Title {...props} {...stylex.props(s.title, style)} />
}

export function DialogDescription({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Description>, 'className' | 'style'> &
  StyleXStyleProps) {
  return <BaseDialog.Description {...props} {...stylex.props(s.description, style)} />
}
