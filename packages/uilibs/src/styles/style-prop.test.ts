import { describe, expect, it } from 'vitest'

// `StyleProp` and `PartProps` in `types.ts` are the one place that spells the `style` prop and the
// omitted `className`, so a part's props change in one file. A hand-written copy drifts from it.
const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}'], {
  eager: true,
  import: 'default',
  query: '?raw'
})

const spelledOutStyle = /\bstyle\??:\s*(?:stylex\.)?StyleXStyles\b/
const spelledOutOmit = /'className' \| 'style'/

const offenders = (pattern: RegExp) =>
  Object.entries(sources)
    .filter(([path]) => path !== './types.ts')
    .flatMap(([path, text]) =>
      text
        .split('\n')
        .map((line, index) => ({ line, at: `${path.replace(/^\.{1,2}\//, '')}:${index + 1}` }))
        .filter(({ line }) => pattern.test(line))
        .map(({ at }) => at)
    )

describe('part props', () => {
  it('take the StyleX `style` from StyleProp or PartProps, never spelled out', () => {
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(200)
    expect(offenders(spelledOutStyle)).toEqual([])
  })

  it('drop `className` and `style` through PartProps or WithoutStyling, never with a copy of the pair', () => {
    expect(offenders(spelledOutOmit)).toEqual([])
  })
})
