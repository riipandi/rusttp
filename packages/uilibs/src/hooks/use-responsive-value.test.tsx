import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { viewport } from '../styles/tokens.stylex'
import {
  mapResponsive,
  resolveResponsiveValue,
  useResponsiveValue,
  type Responsive
} from './use-responsive-value'

const reached = (width: number) => ({
  medium: width >= viewport.medium,
  large: width >= viewport.large,
  xlarge: width >= viewport.xlarge
})

const double = (value: number) => value * 2

describe('mapResponsive', () => {
  it('keeps a plain value plain and an unset value unset', () => {
    expect(mapResponsive(3, double)).toBe(6)
    expect(mapResponsive(0, double)).toBe(0)
    expect(mapResponsive(undefined, double)).toBeUndefined()
  })

  it('maps each breakpoint of a map and keeps the keys that were set', () => {
    expect(mapResponsive({ small: 1, large: 3 }, double)).toStrictEqual({ small: 2, large: 6 })
    expect(mapResponsive({ medium: 0, xlarge: 5 }, double)).toEqual({ medium: 0, xlarge: 10 })
  })

  it('drops a key whose value is undefined and does not call the mapper for it', () => {
    const seen: number[] = []
    const out = mapResponsive({ small: 1, medium: undefined }, (value) => seen.push(value))
    expect(out).toStrictEqual({ small: 1 })
    expect(seen).toEqual([1])
  })
})

describe('resolveResponsiveValue', () => {
  it('returns a plain value for every viewport', () => {
    expect(resolveResponsiveValue('row', reached(390))).toBe('row')
    expect(resolveResponsiveValue(0, reached(1400))).toBe(0)
  })

  it('takes the largest breakpoint reached that has a value', () => {
    const value = { small: 'a', medium: 'b', large: 'c', xlarge: 'd' } as const
    expect(resolveResponsiveValue(value, reached(390))).toBe('a')
    expect(resolveResponsiveValue(value, reached(660))).toBe('b')
    expect(resolveResponsiveValue(value, reached(900))).toBe('c')
    expect(resolveResponsiveValue(value, reached(1280))).toBe('d')
  })

  it('lets an omitted breakpoint inherit the nearest smaller one, not a larger one', () => {
    const value = { small: 'a', xlarge: 'd' } as const
    expect(resolveResponsiveValue(value, reached(1000))).toBe('a')
    const gap = { small: 'a', medium: 'b', xlarge: 'd' } as const
    expect(resolveResponsiveValue(gap, reached(1000))).toBe('b')
  })

  it('keeps a falsy value the caller set, and has none below the first breakpoint given', () => {
    expect(resolveResponsiveValue({ small: true, medium: false }, reached(700))).toBe(false)
    expect(resolveResponsiveValue({ small: 3, large: 0 }, reached(1000))).toBe(0)
    expect(resolveResponsiveValue({ large: 'x' }, reached(390))).toBeUndefined()
  })
})

function Probe({ value }: { value: Responsive<string> }) {
  return <output>{useResponsiveValue(value) ?? 'none'}</output>
}

describe('useResponsiveValue', () => {
  it('follows the viewport across both sides of every breakpoint', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const root = createRoot(host)
    const value = { small: 'phone', medium: 'tablet', large: 'laptop', xlarge: 'desktop' }
    const { innerWidth, innerHeight } = window
    try {
      for (const [width, expected] of [
        [viewport.medium - 1, 'phone'],
        [viewport.medium, 'tablet'],
        [viewport.large - 1, 'tablet'],
        [viewport.large, 'laptop'],
        [viewport.xlarge - 1, 'laptop'],
        [viewport.xlarge, 'desktop'],
        [viewport.medium - 1, 'phone']
      ] as const) {
        await page.viewport(width, 800)
        root.render(<Probe value={value} />)
        await expect.poll(() => host.textContent).toBe(expected)
      }
    } finally {
      await page.viewport(innerWidth, innerHeight)
      root.unmount()
      host.remove()
    }
  })
})
