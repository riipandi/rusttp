import * as stylex from '@stylexjs/stylex'

export const labelStyles = stylex.create({
  // The label is a flex box: without this it spans the row, and the empty space beside the text
  // would toggle the control.
  root: {
    width: 'fit-content'
  }
})
