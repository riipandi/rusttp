import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Button } from '../../base/button'
import { Separator } from '../../base/separator'
import { buttonGroupStyles as s } from './button-group.stylex'
import { buttonGroupOrientations as orientations } from './button-group.stylex'
import { buttonGroupJoined as joined } from './button-group.stylex'
import { buttonGroupDividerEdges, buttonGroupSharedEdges } from './button-group.stylex'

interface StyleProp {
  style?: stylex.StyleXStyles
}

function hasStyleProp(props: unknown): props is StyleProp {
  return typeof props === 'object' && props !== null && 'style' in props
}

export interface ButtonGroupProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'>, StyleProp {
  orientation?: 'horizontal' | 'vertical'
}

/** Children in order, with Fragments opened up and the keys that `toArray` gave them kept. */
function flatten(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment
      ? flatten(child.props.children)
      : [child]
  )
}

/** A filled Button has no border to share, so the group draws a divider for it. */
function isFilledButton(child: React.ReactElement<object>) {
  if (child.type !== Button) return false
  const variant = 'variant' in child.props ? child.props.variant : undefined
  return (
    variant === undefined ||
    variant === 'primary' ||
    variant === 'secondary' ||
    variant === 'destructive'
  )
}

/**
 * Fuses its children (Buttons, Inputs, …) into one segmented control. StyleX has no child
 * selectors, so the group clones each element child and passes position styles through the
 * child's `style` prop: every child must accept `style` (every component in this library does),
 * and a wrapper that does not (a menu root) has to be styled by hand. Fragments are opened up and
 * text is left as it is. A bordered child (outline Button, Input) shares its neighbour's edge;
 * a filled Button gets a divider instead.
 */
export function ButtonGroup({
  orientation = 'horizontal',
  style,
  children,
  ...props
}: ButtonGroupProps) {
  const nodes = flatten(children)
  const count = nodes.filter(React.isValidElement).length
  let index = -1
  return (
    <div role='group' {...props} {...stylex.props(s.root, orientations[orientation], style)}>
      {nodes.map((child) => {
        if (!React.isValidElement<object>(child)) return child
        index += 1
        const position =
          count === 1 ? null : index === 0 ? 'first' : index === count - 1 ? 'last' : 'middle'
        const childStyle = hasStyleProp(child.props) ? child.props.style : undefined
        const edges = isFilledButton(child) ? buttonGroupDividerEdges : buttonGroupSharedEdges
        const edge = position && position !== 'first' && edges[orientation]
        const childProps: Partial<StyleProp> & { key: React.Key } = {
          key: child.key ?? index,
          style: [position && joined[`${orientation}-${position}`], edge, childStyle]
        }
        return React.cloneElement(child, childProps)
      })}
    </div>
  )
}

export function ButtonGroupText({
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'className' | 'style'> & StyleProp) {
  return <div {...props} {...stylex.props(s.text, style)} />
}

export function ButtonGroupSeparator({
  orientation = 'vertical',
  style,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return <Separator orientation={orientation} {...props} style={[s.separator, style]} />
}
