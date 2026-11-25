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
