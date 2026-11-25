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
import type { ColorRole, StyleProp } from '../../styles/types'
import { meterColors, meterSizes, meterStyles as s } from './meter.stylex'

export type MeterColor = ColorRole
export type MeterSize = 'sm' | 'md'

/** The root's `color` and `size`, read by its track and indicator. */
const MeterLookContext = React.createContext<{ color: MeterColor; size: MeterSize }>({
  color: 'primary',
  size: 'md'
})

export function Meter({
  color = 'primary',
  size = 'md',
  style,
  children,
  ...props
}: Omit<React.ComponentProps<typeof BaseMeter.Root>, 'className' | 'style' | 'color'> &
  StyleProp & {
    /** The role of the fill; `primary` by default. Pair a non-neutral color with a label: color alone is not meaning. */
    color?: MeterColor
    /** Bar thickness: `sm` 2px, `md` 4px (default). */
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
}: Omit<React.ComponentProps<typeof BaseMeter.Track>, 'className' | 'style'> & StyleProp) {
  const { size } = React.useContext(MeterLookContext)
  return <BaseMeter.Track {...props} {...stylex.props(s.track, meterSizes[size], style)} />
}

export function MeterIndicator({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseMeter.Indicator>, 'className' | 'style'> & StyleProp) {
  const { color } = React.useContext(MeterLookContext)
  return (
    <BaseMeter.Indicator {...props} {...stylex.props(s.indicator, meterColors[color], style)} />
  )
}

export function MeterLabel({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseMeter.Label>, 'className' | 'style'> & StyleProp) {
  return <BaseMeter.Label {...props} {...stylex.props(s.label, style)} />
}

export function MeterValue({
  style,
  ...props
}: Omit<React.ComponentProps<typeof BaseMeter.Value>, 'className' | 'style'> & StyleProp) {
  return <BaseMeter.Value {...props} {...stylex.props(s.value, style)} />
}
