/**
 * A dialog that requires a user response to proceed.
 *
 * @see: https://base-ui.com/react/components/alert-dialog
 *
 * BaseUI Anatomy:
 * <AlertDialog.Root>
 *   <AlertDialog.Trigger />
 *   <AlertDialog.Portal>
 *     <AlertDialog.Backdrop />
 *     <AlertDialog.Viewport>
 *       <AlertDialog.Popup>
 *         <AlertDialog.Title />
 *         <AlertDialog.Description />
 *         <AlertDialog.Close />
 *       </AlertDialog.Popup>
 *     </AlertDialog.Viewport>
 *   </AlertDialog.Portal>
 * </AlertDialog.Root>
 */

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { shadow } from '../../styles/colors.stylex'
import { popupFx } from '../../styles/popup.stylex'
import { type } from '../../styles/type.stylex'
import type { StyleProp } from '../../styles/types'
import { ring } from '../../styles/utils.stylex'
import { usePortalContainer } from '../../theme/theme-scope.context'
import { Button, type ButtonProps } from '../button'
import { alertDialogStyles as s, alertDialogSizes as sizes } from './alert-dialog.stylex'

export const AlertDialog = BaseAlertDialog.Root
export const AlertDialogTrigger = BaseAlertDialog.Trigger
export const AlertDialogPortal = BaseAlertDialog.Portal

export function AlertDialogOverlay({
  blurredOverlay = false,
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAlertDialog.Backdrop>, 'className' | 'style'> &
  StyleProp & {
    /** Blurs the page behind the backdrop. */
    blurredOverlay?: boolean
  }) {
  return (
    <BaseAlertDialog.Backdrop
      {...props}
      {...stylex.props(popupFx.scrim, s.overlay, blurredOverlay && popupFx.scrimBlurred, style)}
    />
  )
}

export type AlertDialogSize = 'small' | 'medium'

export function AlertDialogContent({
  style,
  size = 'medium',
  blurredOverlay = false,
  ...props
}: Omit<React.ComponentProps<typeof BaseAlertDialog.Popup>, 'className' | 'style'> &
  StyleProp & {
    size?: AlertDialogSize
    /** Blurs the page behind the backdrop. */
    blurredOverlay?: boolean
  }) {
  return (
    <BaseAlertDialog.Portal container={usePortalContainer()}>
      <AlertDialogOverlay blurredOverlay={blurredOverlay} />
      <BaseAlertDialog.Viewport {...stylex.props(s.viewport)}>
        <BaseAlertDialog.Popup
          {...props}
          {...stylex.props(s.content, sizes[size], ring({ shadow: shadow.overlay }), style)}
        />
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  )
}

export function AlertDialogHeader({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function AlertDialogMedia({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.media, style)} />
}

export function AlertDialogFooter({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.footer, style)} />
}

export function AlertDialogTitle({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAlertDialog.Title>, 'className' | 'style'> & StyleProp) {
  return <BaseAlertDialog.Title {...props} {...stylex.props(type.body1, s.title, style)} />
}

export function AlertDialogDescription({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAlertDialog.Description>, 'className' | 'style'> &
  StyleProp) {
  return <BaseAlertDialog.Description {...props} {...stylex.props(s.description, style)} />
}

type AlertDialogButtonProps = Omit<
  React.ComponentProps<typeof BaseAlertDialog.Close>,
  'className' | 'style' | 'color'
> &
  Pick<ButtonProps, 'variant' | 'color' | 'size' | 'loading'> &
  StyleProp

/**
 * The confirming button: it closes the dialog like `AlertDialogCancel`, after its `onClick` runs.
 * To keep the dialog open while work is pending (a failed request, a validation), call
 * `event.preventBaseUIHandler()` in `onClick` and close through the dialog's `open` state later.
 */
export function AlertDialogAction({
  variant = 'solid',
  color,
  size = 'medium',
  style,
  ...props
}: AlertDialogButtonProps) {
  return (
    <BaseAlertDialog.Close
      render={<Button variant={variant} color={color} size={size} style={style} />}
      {...props}
    />
  )
}

export function AlertDialogCancel({
  variant = 'outline',
  color,
  size = 'medium',
  style,
  ...props
}: AlertDialogButtonProps) {
  return (
    <BaseAlertDialog.Close
      render={<Button variant={variant} color={color} size={size} style={style} />}
      {...props}
    />
  )
}
