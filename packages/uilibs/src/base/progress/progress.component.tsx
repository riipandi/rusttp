/**
 * Displays the status of a task that takes a long time.
 *
 * @see: https://base-ui.com/react/components/progress
 *
 * BaseUI Anatomy:
 * <Progress.Root>
 *   <Progress.Label />
 *   <Progress.Track>
 *     <Progress.Indicator />
 *   </Progress.Track>
 *   <Progress.Value />
 * </Progress.Root>
 */

import { Progress as BaseProgress } from '@base-ui/react/progress'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { progressColors, progressSizes, progressStyles as s } from './progress.stylex'

export type ProgressColor = 'neutral' | 'primary' | 'positive' | 'warning' | 'critical'
export type ProgressSize = 'sm' | 'md'

/** The root's `color` and `size`, read by its track and indicator. */
const ProgressLookContext = React.createContext<{ color: ProgressColor; size: ProgressSize }>({
  color: 'primary',
  size: 'md'
})

interface StyleXStyleProps {
  style?: stylex.StyleXStyles
}

export function Progress({
  color = 'primary',
  size = 'md',
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseProgress.Root>, 'className' | 'style' | 'color'> &
  StyleXStyleProps & {
    /** The role of the fill; `primary` by default. Pair a non-neutral color with a label: color alone is not meaning. */
    color?: ProgressColor
    /** Bar thickness: `sm` 2px, `md` 4px (default). */
    size?: ProgressSize
  }) {
  const look = React.useMemo(() => ({ color, size }), [color, size])
  return (
    <ProgressLookContext.Provider value={look}>
      <BaseProgress.Root {...props} {...stylex.props(s.root, style)}>
        {children}
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </BaseProgress.Root>
    </ProgressLookContext.Provider>
  )
}

export function ProgressTrack({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseProgress.Track>, 'className' | 'style'> &
  StyleXStyleProps) {
  const { size } = React.useContext(ProgressLookContext)
  return <BaseProgress.Track {...props} {...stylex.props(s.track, progressSizes[size], style)} />
}

export function ProgressIndicator({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseProgress.Indicator>, 'className' | 'style'> &
  StyleXStyleProps) {
  const { color } = React.useContext(ProgressLookContext)
  return (
    <BaseProgress.Indicator
      {...props}
      {...stylex.props(s.indicator, progressColors[color], style)}
    />
  )
}

export function ProgressLabel({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseProgress.Label>, 'className' | 'style'> &
  StyleXStyleProps) {
  return <BaseProgress.Label {...props} {...stylex.props(s.label, style)} />
}

export function ProgressValue({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseProgress.Value>, 'className' | 'style'> &
  StyleXStyleProps) {
  return <BaseProgress.Value {...props} {...stylex.props(s.value, style)} />
}
