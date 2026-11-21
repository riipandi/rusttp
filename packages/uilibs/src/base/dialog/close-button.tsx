import { X } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { focusRing } from '../../styles/utils.stylex'
import { closeButtonStyles as s } from './close-button.stylex'

/** Accessible names of the dismiss button in Dialog, Sheet, and Toast. */
export interface CloseLabels {
  /** Name of the dismiss button. Defaults to `Close`. */
  close: string
}

/**
 * The dismiss button of Dialog, Sheet, and Toast: one glyph, one hover, one focus ring. It is
 * rendered through each primitive's own Close part (`render={<CloseButton />}`), which brings the
 * behavior; position it with `style`.
 */
export function CloseButton({
  label = 'Close',
  style,
  ...props
}: Omit<React.ComponentProps<'button'>, 'className' | 'style'> & {
  label?: string
  style?: stylex.StyleXStyles
}) {
  return (
    <button
      type='button'
      aria-label={label}
      {...props}
      {...stylex.props(focusRing.root, s.root, style)}
    >
      <X size={16} strokeWidth={1.5} aria-hidden />
    </button>
  )
}
