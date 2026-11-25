import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { resolveResponsiveValue, useResponsiveValue, type Responsive } from './use-responsive-value'

const reached = (width: number) => ({
  medium: width >= 660,
  large: width >= 900,
  xlarge: width >= 1280
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
  it('follows the viewport as it changes', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const root = createRoot(host)
    const value = { small: 'phone', medium: 'tablet', xlarge: 'desktop' }
    try {
      for (const [width, expected] of [
        [390, 'phone'],
        [1000, 'tablet'],
        [1400, 'desktop'],
        [390, 'phone']
      ] as const) {
        await page.viewport(width, 800)
        root.render(<Probe value={value} />)
        await expect.poll(() => host.textContent).toBe(expected)
      }
    } finally {
      root.unmount()
      host.remove()
    }
  })
})
