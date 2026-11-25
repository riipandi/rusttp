import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { type CloseLabels, CloseButton } from '../../base/dialog/close-button'
import { popupFx } from '../../styles/popup.stylex'
import { type } from '../../styles/type.stylex'
import type { StyleProp } from '../../styles/types'
import { usePortalContainer } from '../../theme/theme-scope.context'
import { sheetStyles as s, sheetSides as sides } from './sheet.stylex'

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

export const Sheet = BaseDialog.Root
export const SheetTrigger = BaseDialog.Trigger
export const SheetClose = BaseDialog.Close
export const SheetPortal = BaseDialog.Portal

export function SheetOverlay({
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

export function SheetContent({
  style,
  children,
  side = 'right',
  blurredOverlay = false,
  showCloseButton = true,
  labels,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Popup>, 'className' | 'style'> &
  StyleProp & {
    side?: SheetSide
    /** Blurs the page behind the backdrop. */
    blurredOverlay?: boolean
    showCloseButton?: boolean
    /** Accessible names of the built-in close button; English by default. */
    labels?: Partial<CloseLabels>
  }) {
  return (
    <BaseDialog.Portal container={usePortalContainer()}>
      <SheetOverlay blurredOverlay={blurredOverlay} />
      <BaseDialog.Popup {...props} {...stylex.props(s.content, sides[side], style)}>
        {children}
        {showCloseButton && (
          <BaseDialog.Close render={<CloseButton labels={labels} style={s.close} />} />
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function SheetHeader({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.header, style)} />
}

export function SheetFooter({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.footer, style)} />
}

export function SheetTitle({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Title>, 'className' | 'style'> & StyleProp) {
  return <BaseDialog.Title {...props} {...stylex.props(type.body1, s.title, style)} />
}

export function SheetDescription({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseDialog.Description>, 'className' | 'style'> & StyleProp) {
  return <BaseDialog.Description {...props} {...stylex.props(s.description, style)} />
}
