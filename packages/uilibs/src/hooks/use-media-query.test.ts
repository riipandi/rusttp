import { describe, expect, it } from 'vitest'
import { parseQuery } from './use-media-query'

describe('parseQuery', () => {
  it.each([
    // A named breakpoint is a lower bound; `small` is the base, so as a lower bound it is `medium`.
    ['medium', '(min-width: 660px)'],
    ['large', '(min-width: 900px)'],
    ['xlarge', '(min-width: 1280px)'],
    ['small', '(min-width: 660px)'],
    // `max-` is the width just below the breakpoint, so the two never match together.
    ['max-medium', '(max-width: 659px)'],
    ['max-small', '(max-width: 659px)'],
    ['max-xlarge', '(max-width: 1279px)'],
    ['medium:max-large', '(min-width: 660px) and (max-width: 899px)'],
    // An unknown segment is dropped; a string with no known segment passes through unchanged.
    ['medium:max-foo', '(min-width: 660px)'],
    ['max-foo', 'max-foo'],
    ['wide', 'wide'],
    ['', ''],
    // A raw query is handed to `matchMedia` as written.
    ['(prefers-reduced-motion: reduce)', '(prefers-reduced-motion: reduce)']
  ])('turns %j into %j', (query, expected) => {
    expect(parseQuery(query)).toBe(expected)
  })

  it.each([
    [{ min: 'large' }, '(min-width: 900px)'],
    [{ max: 'large' }, '(max-width: 899px)'],
    [{ min: 700, max: 1000 }, '(min-width: 700px) and (max-width: 999px)'],
    [{ min: 0 }, '(min-width: 0px)'],
    [{ pointer: 'coarse' }, '(pointer: coarse)'],
    [{ min: 'medium', pointer: 'fine' }, '(min-width: 660px) and (pointer: fine)'],
    [{}, '(min-width: 0px)']
  ] as const)('turns the object %j into %j', (query, expected) => {
    expect(parseQuery(query)).toBe(expected)
  })
})
