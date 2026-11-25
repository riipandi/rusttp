import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { fieldLabelStyles } from '../../base/field/field.stylex'
import { type } from '../../styles/type.stylex'

const s = stylex.create({
  // The label is a flex box: without this it spans the row, and the empty space beside the text
  // would toggle the control.
  root: {
    width: 'fit-content'
  }
})

export interface LabelProps extends Omit<React.ComponentProps<'label'>, 'className' | 'style'> {
  style?: stylex.StyleXStyles
}

export function Label({ style, ...props }: LabelProps) {
  return (
    <label
      {...props}
      {...stylex.props(type.body2, fieldLabelStyles.base, fieldLabelStyles.invalid, s.root, style)}
    />
  )
}
