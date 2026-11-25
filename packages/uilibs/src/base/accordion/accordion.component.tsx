/**
 * A set of collapsible panels with headings.
 *
 * @see: https://base-ui.com/react/components/accordion
 *
 * BaseUI Anatomy:
 * <Accordion.Root>
 *   <Accordion.Item>
 *     <Accordion.Header>
 *       <Accordion.Trigger />
 *     </Accordion.Header>
 *     <Accordion.Panel />
 *   </Accordion.Item>
 * </Accordion.Root>
 */

import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { ChevronDown } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { glyphSize } from '../../styles/glyph'
import type { StyleProp } from '../../styles/types'
import { focusRing } from '../../styles/utils.stylex'
import { accordionStyles as s } from './accordion.stylex'

export function Accordion({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAccordion.Root>, 'className' | 'style'> & StyleProp) {
  return <BaseAccordion.Root {...props} {...stylex.props(s.root, style)} />
}

export function AccordionItem({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseAccordion.Item>, 'className' | 'style'> & StyleProp) {
  return <BaseAccordion.Item {...props} {...stylex.props(s.item, style)} />
}

export function AccordionTrigger({
  iconPosition = 'end',
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseAccordion.Trigger>, 'className' | 'style'> &
  StyleProp & {
    /** Which side of the label the chevron is on: `end` (default) or `start`. */
    iconPosition?: 'start' | 'end'
  }) {
  const start = iconPosition === 'start'
  return (
    <BaseAccordion.Header {...stylex.props(s.header)}>
      <BaseAccordion.Trigger
        {...props}
        {...stylex.props(focusRing.root, s.trigger, start && s.triggerIconStart, style)}
      >
        {children}
        <ChevronDown
          size={glyphSize.medium}
          strokeWidth={1.5}
          aria-hidden
          {...stylex.props(s.chevron, start && s.chevronStart)}
        />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

export function AccordionContent({
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseAccordion.Panel>, 'className' | 'style'> & StyleProp) {
  return (
    <BaseAccordion.Panel {...props} {...stylex.props(s.panel)}>
      <div {...stylex.props(s.inner, style)}>{children}</div>
    </BaseAccordion.Panel>
  )
}
