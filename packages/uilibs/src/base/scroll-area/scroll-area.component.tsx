/**
 * A container with scrollable content.
 *
 * @see: https://base-ui.com/react/components/scroll-area
 *
 * BaseUI Anatomy:
 * <ScrollArea.Root>
 *   <ScrollArea.Viewport>
 *     {content}
 *   </ScrollArea.Viewport>
 *   <ScrollArea.Scrollbar orientation={orientation}>
 *     <ScrollArea.Thumb />
 *   </ScrollArea.Scrollbar>
 * </ScrollArea.Root>
 */

import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { focusRing } from '../../styles/utils.stylex'
import { scrollAreaStyles as s } from './scroll-area.stylex'
import { scrollAreaScrollbarOrientations as orientations } from './scroll-area.stylex'
import { scrollAreaDisplays, scrollAreaFadeStyles } from './scroll-area.stylex'

interface StyleXStyleProps {
  style?: stylex.StyleXStyles
}

/** `hover` shows the bar while the pointer is over the area or it scrolls; `scroll` only while it scrolls; `visible` always; `hidden` never. */
export type ScrollbarDisplay = 'visible' | 'hover' | 'scroll' | 'hidden'

export function ScrollArea({
  style,
  children,
  fade = false,
  orientation = 'vertical',
  scrollbarDisplay = 'hover',
  ...props
}: Omit<React.ComponentProps<typeof BaseScrollArea.Root>, 'className' | 'style'> &
  StyleXStyleProps & {
    /** Display a fade mask on the sides of the area that can be scrolled towards. */
    fade?: boolean
    /** Which scrollbars are drawn: one for each axis named, with the corner where both meet. */
    orientation?: 'vertical' | 'horizontal' | 'both'
    scrollbarDisplay?: ScrollbarDisplay
  }) {
  return (
    <BaseScrollArea.Root {...props} {...stylex.props(s.root, style)}>
      <BaseScrollArea.Viewport
        {...stylex.props(focusRing.root, s.viewport, fade && scrollAreaFadeStyles.fade)}
      >
        {children}
      </BaseScrollArea.Viewport>
      {orientation !== 'horizontal' && (
        <ScrollBar orientation='vertical' display={scrollbarDisplay} />
      )}
      {orientation !== 'vertical' && (
        <ScrollBar orientation='horizontal' display={scrollbarDisplay} />
      )}
      <BaseScrollArea.Corner />
    </BaseScrollArea.Root>
  )
}

export function ScrollBar({
  orientation = 'vertical',
  display = 'hover',
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseScrollArea.Scrollbar>, 'className' | 'style'> &
  StyleXStyleProps & { display?: ScrollbarDisplay }) {
  return (
    <BaseScrollArea.Scrollbar
      orientation={orientation}
      {...props}
      {...stylex.props(
        s.scrollbar,
        display !== 'hover' && scrollAreaDisplays[display],
        orientations[orientation],
        style
      )}
    >
      <BaseScrollArea.Thumb {...stylex.props(s.thumb)} />
    </BaseScrollArea.Scrollbar>
  )
}
