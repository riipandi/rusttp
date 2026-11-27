import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { ButtonVariant } from '../../base/button'
import {
  ButtonGroupContext,
  type ButtonGroupPosition,
  buttonGroupMember,
  useButtonGroup
} from '../../base/button/button-group.context'
import { Separator } from '../../base/separator'
import type { ControlSize, PartProps } from '../../styles/types'
import { buttonGroupStyles as s } from './button-group.stylex'
import { buttonGroupOrientations as orientations } from './button-group.stylex'

export interface ButtonGroupProps extends PartProps<React.ComponentProps<'div'>> {
  orientation?: 'horizontal' | 'vertical'
  /** The size every member takes unless it sets its own; `medium` when neither is set. */
  size?: ControlSize
  /** The variant every Button takes unless it sets its own. */
  variant?: ButtonVariant
}

interface Member {
  key: string
  node: React.ReactNode
}

/**
 * Children in order with Fragments opened up. A nested child's key is its whole path, so the keys
 * of a Fragment's children cannot collide with the outer ones.
 */
function flatten(children: React.ReactNode, path = ''): Member[] {
  return React.Children.toArray(children).flatMap((child): Member[] => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return [{ key: path, node: child }]
    }
    const key = `${path}${child.key}`
    return child.type === React.Fragment
      ? flatten(child.props.children, key)
      : [{ key, node: child }]
  })
}

/**
 * Fuses its children (Buttons, Inputs, …) into one segmented control. Each element child is one
 * member: the group tells it its position through context, and the Button, Input, Select, and
 * InputGroup inside it square the corners they share and drop (or replace with a divider) the edge
 * they share. Because it travels through the React tree, a Button that a trigger renders, or that
 * sits in a Tooltip, is joined too. Fragments are opened up and text is left as it is.
 */
export function ButtonGroup({
  orientation = 'horizontal',
  size,
  variant,
  style,
  children,
  ...props
}: ButtonGroupProps) {
  const members = flatten(children)
  const count = members.filter((member) => React.isValidElement(member.node)).length
  let index = -1
  return (
    <div role='group' {...props} {...stylex.props(s.root, orientations[orientation], style)}>
      {members.map(({ key, node }) => {
        if (!React.isValidElement(node)) return node
        index += 1
        const position: ButtonGroupPosition | null =
          count === 1 ? null : index === 0 ? 'first' : index === count - 1 ? 'last' : 'middle'
        return (
          <ButtonGroupContext.Provider key={key} value={{ orientation, position, size, variant }}>
            {node}
          </ButtonGroupContext.Provider>
        )
      })}
    </div>
  )
}

export function ButtonGroupText({ style, ...props }: PartProps<React.ComponentProps<'div'>>) {
  const group = useButtonGroup()
  return <div {...props} {...stylex.props(s.text, buttonGroupMember(group, false), style)} />
}

export function ButtonGroupSeparator({
  orientation = 'vertical',
  style,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return <Separator orientation={orientation} {...props} style={[s.separator, style]} />
}
