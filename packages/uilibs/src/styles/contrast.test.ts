import { describe, expect, it } from 'vitest'
// oxlint-disable-next-line import/default -- Vite's `?raw` query: the file's text, as the default export
import lightSource from './colors.stylex.ts?raw'
// oxlint-disable-next-line import/default -- Vite's `?raw` query: the file's text, as the default export
import darkSource from './themes.ts?raw'

// The token values live in StyleX source: `stylex.defineVars` compiles them into `var(--x…)`, so a
// test reads the source text, where the OKLCH strings are. Each pair below is a WCAG 2.2 contrast
// bar the library promises: 4.5:1 for text (1.4.3) and 3:1 for the parts that identify a control
// (1.4.11). Alpha colors are blended over the surface they sit on, the way the browser draws them.

type Rgb = readonly [number, number, number]

const toLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
const toGamma = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055
const clamp = (value: number) => Math.min(1, Math.max(0, value))

/** `oklch(L C H / A)` to gamma-encoded sRGB (out-of-gamut channels clamp) and alpha. */
function oklchToSrgb(color: string): { rgb: Rgb; alpha: number } {
  const match = color.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/)
  if (!match) throw new Error(`Not an oklch() color: ${color}`)
  const [, l = '0', c = '0', h = '0', a = '1'] = match
  const hue = (Number(h) * Math.PI) / 180
  const A = Number(c) * Math.cos(hue)
  const B = Number(c) * Math.sin(hue)
  const L = Number(l)
  const lp = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const mp = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const sp = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const linear = [
    4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
    -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
    -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp
  ] as const
  return {
    rgb: [toGamma(clamp(linear[0])), toGamma(clamp(linear[1])), toGamma(clamp(linear[2]))],
    alpha: Number(a)
  }
}

/** WCAG relative luminance of a gamma-encoded sRGB color. */
const luminance = ([r, g, b]: Rgb) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)

const ratioOf = (a: Rgb, b: Rgb) => {
  const [la, lb] = [luminance(a), luminance(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

type Tokens = Record<string, string>

/** The `name: 'value'` lines between `start` and the next `})`. */
function readTokens(source: string, start: string): Tokens {
  const from = source.indexOf(start)
  if (from === -1) throw new Error(`No "${start}" block`)
  const block = source.slice(from, source.indexOf('})', from))
  return Object.fromEntries(
    Array.from(block.matchAll(/^\s+(\w+):\s*'([^']+)'/gm), (m) => [m[1], m[2]])
  )
}

const light = readTokens(lightSource, 'export const colors = stylex.defineVars({')
const dark = {
  ...light,
  ...readTokens(darkSource, 'const darkColors = stylex.createTheme(colors, {')
}
const themes = { light, dark } as const

function paint(theme: Tokens, name: string, over: Rgb): Rgb {
  const value = theme[name]
  if (!value) throw new Error(`No token ${name}`)
  const { rgb, alpha } = oklchToSrgb(value)
  const blend = (index: 0 | 1 | 2) => rgb[index] * alpha + over[index] * (1 - alpha)
  return [blend(0), blend(1), blend(2)]
}

/** Contrast of token `fg` drawn on token `bg`, itself drawn on the page (or on `surface`). */
function contrast(theme: Tokens, fg: string, bg: string, surface = 'backgroundPage') {
  const base = paint(theme, surface, [1, 1, 1])
  const back = paint(theme, bg, base)
  return ratioOf(paint(theme, fg, back), back)
}

const roles = ['Primary', 'Critical', 'Positive', 'Warning'] as const

describe('the contrast converter', () => {
  it('matches known colors', () => {
    // Neutral OKLCH lightness cubes into luminance: L 0.6 on white is 1.05 / (0.6³ + 0.05).
    expect(ratioOf(oklchToSrgb('oklch(0.6 0 0)').rgb, [1, 1, 1])).toBeCloseTo(
      1.05 / (0.216 + 0.05),
      2
    )
    expect(ratioOf(oklchToSrgb('oklch(0 0 0)').rgb, oklchToSrgb('oklch(1 0 0)').rgb)).toBeCloseTo(
      21,
      5
    )
    // CSS Color 4's oklch() for sRGB red is 62.8% 0.2577 29.23; pure red has luminance 0.2126.
    expect(luminance(oklchToSrgb('oklch(0.628 0.2577 29.23)').rgb)).toBeCloseTo(0.2126, 2)
  })
})

describe.each(Object.entries(themes))('%s theme', (_name, theme) => {
  describe('text, 4.5:1', () => {
    it('neutral text on the page', () => {
      expect(contrast(theme, 'foregroundNeutral', 'backgroundPage')).toBeGreaterThanOrEqual(4.5)
    })

    it('faded neutral text on the page and on a neutral fill', () => {
      expect(contrast(theme, 'foregroundNeutralFaded', 'backgroundPage')).toBeGreaterThanOrEqual(
        4.5
      )
      expect(contrast(theme, 'foregroundNeutralFaded', 'backgroundNeutral')).toBeGreaterThanOrEqual(
        4.5
      )
    })

    it.each(roles)('%s text on the page and on its faded fill', (role) => {
      expect(contrast(theme, `foreground${role}`, 'backgroundPage')).toBeGreaterThanOrEqual(4.5)
      expect(contrast(theme, `foreground${role}`, `background${role}Faded`)).toBeGreaterThanOrEqual(
        4.5
      )
    })

    it.each(roles)('text on a solid %s fill, at rest and highlighted', (role) => {
      expect(contrast(theme, `onBackground${role}`, `background${role}`)).toBeGreaterThanOrEqual(
        4.5
      )
      expect(
        contrast(theme, `onBackground${role}`, `background${role}Highlighted`)
      ).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('controls, 3:1', () => {
    it.each(['backgroundPage', 'backgroundElevationOverlay'])(
      'the control edge on %s',
      (surface) => {
        expect(contrast(theme, 'borderControl', surface, surface)).toBeGreaterThanOrEqual(3)
      }
    )

    it.each(['backgroundPage', 'backgroundElevationOverlay'])('the focus ring on %s', (surface) => {
      expect(contrast(theme, 'foregroundPrimary', surface, surface)).toBeGreaterThanOrEqual(3)
    })
  })
})

// Known failures: each flips to a plain `it` in the phase that fixes it, and until then the
// expectation below fails by design, so the day a fix lands the flip is forced.
describe('known contrast failures', () => {
  // X-01: the keyboard-highlighted option is `backgroundNeutralFaded` on the popup, 1.07:1 and 1.12:1.
  for (const [name, theme] of Object.entries(themes)) {
    it.fails(`the highlighted option against its popup, ${name} (X-01)`, () => {
      expect(
        contrast(
          theme,
          'backgroundNeutralFaded',
          'backgroundElevationOverlay',
          'backgroundElevationOverlay'
        )
      ).toBeGreaterThanOrEqual(3)
    })
  }

  // X-04: the primary indicator on the neutral track is 4.32:1 in light and 2.46:1 in dark.
  it('the primary indicator against the track, light (X-04)', () => {
    expect(contrast(light, 'backgroundPrimary', 'backgroundNeutral')).toBeGreaterThanOrEqual(3)
  })

  it.fails('the primary indicator against the track, dark (X-04)', () => {
    expect(contrast(dark, 'backgroundPrimary', 'backgroundNeutral')).toBeGreaterThanOrEqual(3)
  })
})
