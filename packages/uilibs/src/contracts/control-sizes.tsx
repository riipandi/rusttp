import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect } from 'storybook/test'
import type { ControlSize, DenseControlSize } from '../styles/control.stylex'
import { visuallyHidden } from '../styles/utils.stylex'

/** The height a control of each size has, in px (`controlSizes`). */
export const controlHeights = { sm: 32, md: 36, lg: 40 } as const satisfies Record<
  ControlSize,
  number
>

/** The same, with the `xs` (28px) that Button, Toggle, and Tabs add. */
export const denseControlHeights = { xs: 28, ...controlHeights } as const satisfies Record<
  DenseControlSize,
  number
>

export const controlSizeNames = ['sm', 'md', 'lg'] as const satisfies readonly ControlSize[]

/** The scale with `xs` first, for Button, Toggle, and Tabs. */
export const denseControlSizeNames = [
  'xs',
  ...controlSizeNames
] as const satisfies readonly DenseControlSize[]

/** A label that names a control without adding to the row, placed after the control so it stays the cell's first element. */
export function HiddenLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} {...stylex.props(visuallyHidden.root)}>
      {children}
    </label>
  )
}

/** Height of the control in the cell of `size`. */
export function measureControl(root: HTMLElement, size: string, cell = '') {
  const control = root.querySelector(`[data-size="${size}"]${cell}`)?.firstElementChild
  if (!control) throw new Error(`No control rendered for size ${size}`)
  return control.getBoundingClientRect().height
}

/** Asserts every size renders at its height from the scale (or at `heights` for a field that is not one line). */
export async function expectControlHeights(
  root: HTMLElement,
  heights: Partial<Record<DenseControlSize, number>> = controlHeights,
  /** Narrows the cells when a second axis crosses the sizes (`[data-part="trigger"]`). */
  cell = ''
) {
  for (const [size, height] of Object.entries(heights)) {
    await expect(measureControl(root, size, cell)).toBe(height)
  }
}

/**
 * Asserts the disabled look of a control's box: half opacity and, for an element that takes the
 * cursor itself (an input or a trigger), `not-allowed`. A wrapper that only dims (a group around an
 * input) passes `cursor: false`.
 */
export async function expectDisabledLook(element: Element, { cursor = true } = {}) {
  const style = getComputedStyle(element)
  await expect(style.opacity).toBe('0.5')
  if (cursor) await expect(style.cursor).toBe('not-allowed')
}

/** The fills of a text-entry control, in the order its `Variants` story draws them. */
export const controlVariantNames = ['outline', 'faded', 'ghost', 'headless'] as const

/**
 * Asserts the fills of a `Variants` story (cells carry `data-variant`): `faded`, `ghost`, and
 * `headless` each differ from `outline` in fill or edge, and every one shows a focus indicator when
 * focused (they have no 3:1 edge at rest, so the ring is what marks the control). `find` picks the
 * box in a cell when it is not the cell's first element.
 */
export async function expectControlVariants(
  root: HTMLElement,
  find: (cell: Element) => Element | null = (cell) => cell.firstElementChild
) {
  const box = (variant: string) => {
    const cell = root.querySelector(`[data-variant="${variant}"]`)
    const element = cell ? find(cell) : null
    if (!(element instanceof HTMLElement)) throw new Error(`No control rendered for ${variant}`)
    return element
  }
  const look = (variant: string) => {
    const style = getComputedStyle(box(variant))
    return { fill: style.backgroundColor, edge: style.borderTopColor }
  }
  const outline = look('outline')
  await expect(look('faded').fill).not.toBe(outline.fill)
  for (const variant of ['faded', 'ghost', 'headless']) {
    await expect(look(variant).edge).not.toBe(outline.edge)
  }
  for (const variant of controlVariantNames) {
    const element = box(variant)
    const focusable = element.matches('input,textarea,button')
      ? element
      : element.querySelector<HTMLElement>('input,textarea,button')
    if (!focusable) throw new Error(`Nothing to focus in ${variant}`)
    focusable.focus()
    await expect(focusable).toHaveFocus()
    await expect(getComputedStyle(element).outlineStyle).not.toBe('none')
    focusable.blur()
  }
}

/** Asserts the rendered box (`width`, `height`) of `selector` in each `data-size` cell. */
export async function expectBoxSizes(
  root: HTMLElement,
  selector: string,
  boxes: Record<string, readonly [number, number]>
) {
  for (const [size, [width, height]] of Object.entries(boxes)) {
    const element = root.querySelector(`[data-size="${size}"] ${selector}`)
    if (!element) throw new Error(`No ${selector} rendered for size ${size}`)
    const rect = element.getBoundingClientRect()
    await expect([rect.width, rect.height]).toEqual([width, height])
  }
}

/** The cell of an `Axis` story where `data-<axis>` is `value`; scope a query to it with `within`. */
export function cellOf(root: HTMLElement, axis: string, value: string): HTMLElement {
  const cell = root.querySelector(`[data-${axis}="${value}"]`)
  if (!(cell instanceof HTMLElement)) throw new Error(`No ${axis} cell for ${value}`)
  return cell
}
