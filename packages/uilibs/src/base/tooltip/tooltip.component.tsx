/**
 * A popup that appears when an element is hovered or focused, showing a hint for sighted users.
 *
 * @see: https://base-ui.com/react/components/tooltip
 *
 * BaseUI Anatomy:
 * <Tooltip.Provider>
 *   <Tooltip.Root>
 *     <Tooltip.Trigger />
 *     <Tooltip.Portal>
 *       <Tooltip.Positioner>
 *         <Tooltip.Popup>
 *           <Tooltip.Arrow />
 *         </Tooltip.Popup>
 *       </Tooltip.Positioner>
 *     </Tooltip.Portal>
 *   </Tooltip.Root>
 * </Tooltip.Provider>
 */

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { PopupShell, type PositionerProps } from '../popup-shell'
import { tooltipStyles as s } from './tooltip.stylex'

// Instant tooltips by default (Base UI's own default is 600ms).
export function TooltipProvider({
  delay = 0,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Provider>) {
  return <BaseTooltip.Provider delay={delay} {...props} />
}

export const Tooltip = BaseTooltip.Root
export const TooltipTrigger = BaseTooltip.Trigger

export interface TooltipContentProps
  extends
    Omit<React.ComponentProps<typeof BaseTooltip.Popup>, 'className' | 'style' | 'color'>,
    PositionerProps {
  /**
   * The surface: `neutral` (default) matches the other popups; `inverted` is the foreground color on
   * the page; `dark` is black with white text in both themes.
   */
  color?: 'neutral' | 'inverted' | 'dark'
  style?: stylex.StyleXStyles
}

export function TooltipContent({
  color = 'neutral',
  style,
  children,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  collisionAvoidance,
  collisionPadding,
  anchor,
  ...props
}: TooltipContentProps) {
  return (
    <PopupShell
      parts={BaseTooltip}
      positioner={{
        side,
        sideOffset,
        align,
        alignOffset,
        collisionAvoidance,
        collisionPadding,
        anchor
      }}
      popupStyle={[
        s.popup,
        color === 'inverted' && s.popupInverted,
        color === 'dark' && s.popupDark
      ]}
      style={style}
      {...props}
    >
      {children}
      <BaseTooltip.Arrow {...stylex.props(s.arrow)}>
        <svg
          width='12'
          height='6'
          viewBox='0 0 12 6'
          aria-hidden='true'
          {...stylex.props(s.arrowSvg)}
        >
          <path
            d='M0 6 L6 0 L12 6 Z'
            {...stylex.props(
              s.arrowFill,
              color === 'inverted' && s.arrowFillInverted,
              color === 'dark' && s.arrowFillDark
            )}
          />
          <path
            d='M0 6 L6 0 L12 6'
            {...stylex.props(
              s.arrowStroke,
              color === 'inverted' && s.arrowStrokeInverted,
              color === 'dark' && s.arrowStrokeDark
            )}
          />
        </svg>
      </BaseTooltip.Arrow>
    </PopupShell>
  )
}
