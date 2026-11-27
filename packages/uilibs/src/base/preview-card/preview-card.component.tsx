/**
 * Displays rich content in a portal with a trigger.
 *
 * @see: https://base-ui.com/react/components/preview-card
 *
 * BaseUI Anatomy:
 * <PreviewCard.Root>
 *   <PreviewCard.Trigger />
 *   <PreviewCard.Portal>
 *     <PreviewCard.Positioner>
 *       <PreviewCard.Popup>
 *         <PreviewCard.Arrow />
 *       </PreviewCard.Popup>
 *     </PreviewCard.Positioner>
 *   </PreviewCard.Portal>
 * </PreviewCard.Root>
 */

import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card'
import * as React from 'react'
import type { PartProps } from '../../styles/types'
import { PopupShell, type PositionerProps } from '../popup-shell'
import { previewCardStyles as s } from './preview-card.stylex'

export const PreviewCard = BasePreviewCard.Root
export const PreviewCardTrigger = BasePreviewCard.Trigger

export interface PreviewCardContentProps
  extends PartProps<React.ComponentProps<typeof BasePreviewCard.Popup>>, PositionerProps {}

export function PreviewCardContent({
  style,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  collisionAvoidance,
  collisionPadding,
  anchor,
  ...props
}: PreviewCardContentProps) {
  return (
    <PopupShell
      parts={BasePreviewCard}
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
