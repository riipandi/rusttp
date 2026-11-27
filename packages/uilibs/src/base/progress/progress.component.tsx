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
import type { ColorRole, PartProps } from '../../styles/types'
import { progressColors, progressSizes, progressStyles as s } from './progress.stylex'

export type ProgressColor = ColorRole
export type ProgressSize = 'small' | 'medium'

/** The root's `color` and `size`, read by its track and indicator. */
const ProgressLookContext = React.createContext<{ color: ProgressColor; size: ProgressSize }>({
  color: 'primary',
  size: 'medium'
})

export function Progress({
  color = 'primary',
  size = 'medium',
  style,
  children,
  ...props
}: PartProps<React.ComponentProps<typeof BaseProgress.Root>, 'color'> & {
  /** The role of the fill; `primary` by default. Pair a non-neutral color with a label: color alone is not meaning. */
  color?: ProgressColor
  /** Bar thickness: `small` 2px, `medium` 4px (default). */
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
}: PartProps<React.ComponentProps<typeof BaseProgress.Track>>) {
  const { size } = React.useContext(ProgressLookContext)
  return <BaseProgress.Track {...props} {...stylex.props(s.track, progressSizes[size], style)} />
}

export function ProgressIndicator({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseProgress.Indicator>>) {
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
}: PartProps<React.ComponentProps<typeof BaseProgress.Label>>) {
  return <BaseProgress.Label {...props} {...stylex.props(s.label, style)} />
}

export function ProgressValue({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseProgress.Value>>) {
  return <BaseProgress.Value {...props} {...stylex.props(s.value, style)} />
}
