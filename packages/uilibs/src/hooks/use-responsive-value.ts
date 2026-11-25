import { useMediaQuery } from './use-media-query'

/**
 * A mobile-first responsive value: one value for every viewport, or an object per breakpoint.
 * `small` is the base; `medium`, `large`, and `xlarge` apply from 660, 900, and 1280 px up, and an
 * omitted key inherits the nearest smaller one.
 */
export type Responsive<T> = T | BreakpointMap<T>

interface BreakpointMap<T> {
  small?: T
  medium?: T
  large?: T
  xlarge?: T
}

const isBreakpointMap = <T>(value: Responsive<T>): value is BreakpointMap<T> =>
  typeof value === 'object' && value !== null

/** Maps each value of a responsive value, keeping its shape: a plain value stays plain. */
export function mapResponsive<T, U>(
  value: Responsive<T> | undefined,
  map: (value: T) => U
): Responsive<U> | undefined {
  if (value === undefined) return undefined
  if (!isBreakpointMap(value)) return map(value)
  const out: BreakpointMap<U> = {}
  for (const key of ['small', 'medium', 'large', 'xlarge'] as const) {
    const entry = value[key]
    if (entry !== undefined) out[key] = map(entry)
  }
  return out
}

/** Which of the `min-width` breakpoints the viewport has reached; `small` always holds. */
export interface BreakpointMatches {
  medium: boolean
  large: boolean
  xlarge: boolean
}

/**
 * Picks the value for a viewport: the largest breakpoint reached that has a value, else the nearest
 * smaller one. A map with nothing at or below the viewport (`{ large: 'x' }` on a phone) resolves
 * to `undefined`, and a plain value to itself.
 */
export function resolveResponsiveValue<T>(
  value: Responsive<T>,
  matches: BreakpointMatches
): T | undefined {
  if (!isBreakpointMap(value)) return value
  // Compare with `undefined`, not truthiness: a `false` or `0` the caller set is a real value.
  if (matches.xlarge && value.xlarge !== undefined) return value.xlarge
  if (matches.large && value.large !== undefined) return value.large
  if (matches.medium && value.medium !== undefined) return value.medium
  return value.small
}

/**
 * The value for the current viewport, for what only exists in JavaScript (a chart's point count, a
 * `size` prop). It follows the viewport live; on the server it resolves for the smallest. Prefer
 * `Hidden` or a responsive style prop where CSS can do it, which never flashes the wrong layout.
 */
export function useResponsiveValue<T>(value: Responsive<T>): T | undefined {
  const medium = useMediaQuery('medium')
  const large = useMediaQuery('large')
  const xlarge = useMediaQuery('xlarge')
  return resolveResponsiveValue(value, { medium, large, xlarge })
}
