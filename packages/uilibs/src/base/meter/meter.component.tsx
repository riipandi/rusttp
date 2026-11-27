/**
 * A graphical display of a numeric value within a range.
 *
 * @see: https://base-ui.com/react/components/meter
 *
 * BaseUI Anatomy:
 * <Meter.Root>
 *   <Meter.Label />
 *   <Meter.Track>
 *     <Meter.Indicator />
 *   </Meter.Track>
 *   <Meter.Value />
 * </Meter.Root>
 */

import { Meter as BaseMeter } from '@base-ui/react/meter'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import type { ColorRole, PartProps } from '../../styles/types'
// Meter draws the same label, track, and fill as Progress, so it reuses that stylesheet. The two
// differ only in role (`meter`, `progressbar`) and in the Base UI parts they wrap.
import {
  progressColors as meterColors,
  progressSizes as meterSizes,
  progressStyles as s
} from '../progress/progress.stylex'

export type MeterColor = ColorRole
export type MeterSize = 'small' | 'medium'

/** The root's `color` and `size`, read by its track and indicator. */
const MeterLookContext = React.createContext<{ color: MeterColor; size: MeterSize }>({
  color: 'primary',
  size: 'medium'
})

export function Meter({
  color = 'primary',
  size = 'medium',
  style,
  children,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMeter.Root>, 'color'> & {
  /** The role of the fill; `primary` by default. Pair a non-neutral color with a label: color alone is not meaning. */
  color?: MeterColor
  /** Bar thickness: `small` 2px, `medium` 4px (default). */
  size?: MeterSize
}) {
  const look = React.useMemo(() => ({ color, size }), [color, size])
  return (
    <MeterLookContext.Provider value={look}>
      <BaseMeter.Root {...props} {...stylex.props(s.root, style)}>
        {children}
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </BaseMeter.Root>
    </MeterLookContext.Provider>
  )
}

export function MeterTrack({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMeter.Track>>) {
  const { size } = React.useContext(MeterLookContext)
  return <BaseMeter.Track {...props} {...stylex.props(s.track, meterSizes[size], style)} />
}

export function MeterIndicator({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMeter.Indicator>>) {
  const { color } = React.useContext(MeterLookContext)
  return (
    <BaseMeter.Indicator {...props} {...stylex.props(s.indicator, meterColors[color], style)} />
  )
}

export function MeterLabel({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMeter.Label>>) {
  return <BaseMeter.Label {...props} {...stylex.props(s.label, style)} />
}

export function MeterValue({
  style,
  ...props
}: PartProps<React.ComponentProps<typeof BaseMeter.Value>>) {
  return <BaseMeter.Value {...props} {...stylex.props(s.value, style)} />
}
