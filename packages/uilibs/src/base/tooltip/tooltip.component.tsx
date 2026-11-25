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
import { shadow } from '../../styles/colors.stylex'
import { popupFx } from '../../styles/popup.stylex'
import { ring } from '../../styles/utils.stylex'
import { usePortalContainer } from '../../theme/theme-scope.context'
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
    Pick<
      React.ComponentProps<typeof BaseTooltip.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    > {
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
  ...props
}: TooltipContentProps) {
  return (
    <BaseTooltip.Portal container={usePortalContainer()}>
      <BaseTooltip.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(popupFx.positioner)}
      >
        <BaseTooltip.Popup
          {...props}
          {...stylex.props(
            popupFx.shift,
            popupFx.fade,
            popupFx.pose,
            s.popup,
            color === 'inverted' && s.popupInverted,
            color === 'dark' && s.popupDark,
            ring({ shadow: shadow.raised }),
            style
          )}
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
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}
