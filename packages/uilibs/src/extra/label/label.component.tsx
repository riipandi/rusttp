import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import { fieldLabelStyles } from '../../base/field/field.stylex'
import { type } from '../../styles/type.stylex'

const s = stylex.create({
  // The label is a flex box: without this it spans the row, and the empty space beside the text
  // would toggle the control.
  root: {
    width: 'fit-content'
  }
})

export interface LabelProps extends Omit<useRender.ComponentProps<'label'>, 'className' | 'style'> {
  style?: stylex.StyleXStyles
}

/** Renders a `label`; `render` swaps it for another element. */
export function Label({ style, render, ...props }: LabelProps) {
  return useRender({
    defaultTagName: 'label',
    props: mergeProps<'label'>(
      stylex.props(type.body2, fieldLabelStyles.base, fieldLabelStyles.invalid, s.root, style),
      props
    ),
    render
  })
}
