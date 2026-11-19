import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { spinnerStyles as s } from './spinner.stylex'

/**
 * `true` inside a control that already has its own name (Button): a Spinner there is decoration,
 * and a second `role='status'` would announce the same busy state twice.
 */
export const LabelledControlContext = React.createContext(false)

export interface SpinnerProps extends Omit<React.ComponentProps<'svg'>, 'className' | 'style'> {
  /** Accessible name when the spinner stands alone. Defaults to `Loading`. */
  label?: string
  style?: stylex.StyleXStyles
}

/** A busy indicator. Alone it is a `status` live region named `label`; inside a Button it is hidden from assistive technology. */
export function Spinner({ label = 'Loading', style, ...props }: SpinnerProps) {
  const decorative = React.useContext(LabelledControlContext)
  return (
    <svg
      {...(decorative ? { 'aria-hidden': true } : { role: 'status', 'aria-label': label })}
      width='16'
      height='16'
      viewBox={`0 0 16 16`}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      {...props}
      {...stylex.props(s.root, style)}
    >
      <path d={`M8 1.5a6.5 6.5 0 1 1-6.5 6.5`} />
    </svg>
  )
}
