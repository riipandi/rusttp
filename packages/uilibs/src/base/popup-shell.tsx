import type { Popover as BasePopover } from '@base-ui/react/popover'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { shadow } from '../styles/colors.stylex'
import { popupFx } from '../styles/popup.stylex'
import { ring } from '../styles/utils.stylex'
import { usePortalContainer } from '../theme/theme-scope.context'

/** The Positioner props every anchored popup takes; each wrapper keeps its own defaults. */
export type PositionerProps = Pick<
  React.ComponentProps<typeof BasePopover.Positioner>,
  | 'side'
  | 'sideOffset'
  | 'align'
  | 'alignOffset'
  | 'collisionPadding'
  | 'collisionAvoidance'
  | 'anchor'
>

/** The three Base UI parts a popup is made of: each namespace (`Popover`, `Menu`, …) has them. */
interface PopupParts {
  Portal: React.ElementType
  Positioner: React.ElementType
  Popup: React.ElementType
}

export interface PopupShellProps {
  /** The Base UI namespace the popup is built on, e.g. `Popover`. */
  parts: PopupParts
  positioner: PositionerProps & {
    /** `Select` only: lay the open list over its trigger. */
    alignItemWithTrigger?: boolean
  }
  /** The component's own popup recipe, composed before `style` so its values win over the shared ones. */
  popupStyle?: stylex.StyleXArray<stylex.CompiledStyles | null | undefined | false>
  /** The `shadow` token the popup's ring draws; `raised` by default. */
  elevation?: 'outline' | 'raised' | 'overlay'
  /** The closed-pose scale and nudge. `false` leaves a popup that fades only (an aligned `Select`). */
  pose?: boolean
  /** The caller's `style`; it replaces the shared and the component's own values. */
  style?: stylex.StyleXStyles
  children?: React.ReactNode
}

/**
 * The portal, positioner, and popup every anchored popup shares: it portals into the nearest
 * `ThemeScope` (`usePortalContainer`), positions with `PositionerProps`, and composes the shared
 * `popupFx` motion and the ring before the component's own recipe and the caller's `style`. Props
 * it does not name go to the popup.
 */
export function PopupShell({
  parts: { Portal, Positioner, Popup },
  positioner,
  popupStyle,
  elevation = 'raised',
  pose = true,
  style,
  ...popupProps
}: PopupShellProps) {
  return (
    <Portal container={usePortalContainer()}>
      <Positioner {...positioner} {...stylex.props(popupFx.positioner)}>
        <Popup
          {...popupProps}
          {...stylex.props(
            popupFx.shift,
            popupFx.fade,
            pose && popupFx.pose,
            popupStyle,
            ring({ shadow: shadow[elevation] }),
            style
          )}
        />
      </Positioner>
    </Portal>
  )
}
