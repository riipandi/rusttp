/**
 * Moves the primary palette to another hue: `node scripts/rebrand.ts <hue>`, a hue in degrees of the
 * OKLCH wheel (0 to 360; red is about 25, orange 50, green 150, blue 255, purple 305).
 *
 * It rewrites the hue of every `background`, `border`, and `foreground` token of the primary role in
 * the three places the palette lives: the light values in `colors.stylex.ts`, and the dark values and
 * the restated light theme in `themes.ts`. Each token keeps its own offset from the base hue (the dark
 * theme's border and text sit a few degrees warmer than its fill), so running it again, with the same
 * or another hue, moves the whole group together. Chroma stays as it is. Lightness moves with the hue,
 * so each token keeps its luminance and with it every contrast ratio `contrast.test.ts` measures; a
 * hue with less room in the sRGB gamut (yellow at high chroma) can still clip a color, so run
 * `pnpm --filter uilibs exec vitest run --project unit` after it and lower the chroma of a token that
 * fails. The result is rounded to four places, so going back to the old hue lands near the old values,
 * not on them: revert with git. It adds no dependency and writes nothing but those two files.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const stylesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles')
const files = ['colors.stylex.ts', 'themes.ts'].map((name) => join(stylesDir, name))

const arg = process.argv[2]
const hue = arg === undefined ? Number.NaN : Number(arg)
if (!Number.isFinite(hue) || hue < 0 || hue > 360) {
  console.error('Usage: node scripts/rebrand.ts <hue>   (degrees, 0 to 360)')
  process.exit(1)
}

// `  backgroundPrimaryFaded: 'oklch(0.98 0.01 39.4)',` and the same with an alpha: groups 2, 3, and 4 are
// the lightness, chroma, and hue; 1 and 5 the text around them. `onBackgroundPrimary` is a constant white and stays.
const token =
  /^(\s*(?:background|border|foreground)Primary\w*:\s*'oklch\()\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(\s*(?:\/\s*[\d.]+\s*)?\)')/

const sources = files.map((file) => readFileSync(file, 'utf8'))

// The base is the hue of the light `backgroundPrimary`, the token the others are offsets of.
const base = Number(
  /^\s*backgroundPrimary:\s*'oklch\(\s*[\d.]+\s+[\d.]+\s+([\d.]+)/m.exec(sources[0]!)?.[1]
)
if (!Number.isFinite(base)) {
  console.error('Found no `backgroundPrimary` oklch token in colors.stylex.ts.')
  process.exit(1)
}
const delta = hue - base

const clamp = (value: number) => Math.min(1, Math.max(0, value))

/** WCAG relative luminance of `oklch(l c h)`, out-of-gamut channels clamped as the contrast test does. */
function luminance(l: number, c: number, h: number): number {
  const radians = (h * Math.PI) / 180
  const a = c * Math.cos(radians)
  const b = c * Math.sin(radians)
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return (
    0.2126 * clamp(4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp) +
    0.7152 * clamp(-1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp) +
    0.0722 * clamp(-0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp)
  )
}

/**
 * The lightness at which `oklch(l c to)` is as bright as `oklch(l c from)`. Contrast depends on
 * luminance only, and the same OKLCH lightness is not the same luminance in every hue (a blue at
 * 0.58 is brighter than an orange at 0.58), so a token keeps its luminance, and with it every ratio
 * the contrast tests measure, by moving its lightness along with its hue.
 */
function sameLuminance(l: number, c: number, from: number, to: number): number {
  const target = luminance(l, c, from)
  let low = 0
  let high = 1
  for (let step = 0; step < 40; step++) {
    const middle = (low + high) / 2
    if (luminance(middle, c, to) < target) low = middle
    else high = middle
  }
  return (low + high) / 2
}

let changed = 0
const next = sources.map((source) =>
  source
    .split('\n')
    .map((line) => {
      const match = token.exec(line)
      if (!match) return line
      const from = Number(match[4])
      const to = (((from + delta) % 360) + 360) % 360
      const lightness = sameLuminance(Number(match[2]), Number(match[3]), from, to)
      changed++
      return line.replace(token, `$1${Number(lightness.toFixed(4))} $3 ${Number(to.toFixed(2))}$5`)
    })
    .join('\n')
)

files.forEach((file, index) => {
  if (next[index] !== sources[index]) writeFileSync(file, next[index]!)
})
console.log(`Primary hue ${base} -> ${hue}: ${changed} tokens in ${files.length} files.`)
