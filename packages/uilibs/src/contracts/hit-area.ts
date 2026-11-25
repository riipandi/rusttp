import { expect } from 'storybook/test'

/** The WCAG 2.5.8 minimum target, in px. */
export const minTarget = 24

const used = (value: string) => Number.parseFloat(value) || 0

/**
 * The box a control answers a pointer in: the element, or its `::after` hit area when that is
 * larger. A hit area is a positioned pseudo-element, so its used size reads from computed style.
 */
export function hitSize(element: Element) {
  const own = element.getBoundingClientRect()
  const after = getComputedStyle(element, '::after')
  return {
    width: Math.max(own.width, used(after.width)),
    height: Math.max(own.height, used(after.height))
  }
}

/** The control reaches `min` px in both directions, counting its `::after` hit area. */
export async function expectHitArea(element: Element, min = minTarget) {
  const { width, height } = hitSize(element)
  await expect(width).toBeGreaterThanOrEqual(min)
  await expect(height).toBeGreaterThanOrEqual(min)
}
