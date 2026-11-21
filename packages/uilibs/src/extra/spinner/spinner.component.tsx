import { LoaderCircle } from '@keyline-icons/react'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { spinnerStyles as s } from './spinner.stylex'

/**
 * `true` inside a control that already has its own name (Button): a Spinner there is decoration,
 * and a second `role='status'` would announce the same busy state twice.
 */
export const LabelledControlContext = React.createContext(false)

export interface SpinnerLabels {
  /** Accessible name when the spinner stands alone. Defaults to `Loading`. */
  loading: string
}

const defaultLabels: SpinnerLabels = { loading: 'Loading' }

export interface SpinnerProps extends Omit<React.ComponentProps<'svg'>, 'className' | 'style'> {
  /** Accessible name of the standing-alone spinner; English by default. */
  labels?: Partial<SpinnerLabels>
  style?: stylex.StyleXStyles
}

/** A busy indicator. Alone it is a `status` live region named `labels.loading`; inside a Button it is hidden from assistive technology. */
export function Spinner({ labels, style, ...props }: SpinnerProps) {
  const loading = { ...defaultLabels, ...labels }.loading
  const decorative = React.useContext(LabelledControlContext)
  return (
    <LoaderCircle
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'status', 'aria-label': loading, 'aria-hidden': false })}
      size={16}
      strokeWidth={1.5}
      {...props}
      {...stylex.props(s.root, style)}
    />
  )
}
