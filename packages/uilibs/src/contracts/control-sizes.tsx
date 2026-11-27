import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect, waitFor } from 'storybook/test'
import { colors } from '../styles/colors.stylex'
import { glyphSize } from '../styles/glyph'
import { type } from '../styles/type.stylex'
import type { ControlSize, DenseControlSize } from '../styles/types'
import { visuallyHidden } from '../styles/utils.stylex'

/** The height a control of each size has, in px (`controlSizes`). */
export const controlHeights = { small: 32, medium: 36, large: 40 } as const satisfies Record<
  ControlSize,
  number
>

/** The same, with the `xsmall` (28px) that Button, Toggle, and Tabs add. */
export const denseControlHeights = { xsmall: 28, ...controlHeights } as const satisfies Record<
  DenseControlSize,
  number
>

export const controlSizeNames = [
  'small',
  'medium',
  'large'
] as const satisfies readonly ControlSize[]

/** The scale with `xsmall` first, for Button, Toggle, and Tabs. */
export const denseControlSizeNames = [
  'xsmall',
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

/** The computed value of a color token, which compiles to a `var(--x…)`: read through a probe element. */
function resolvedColor(token: string, property: 'color' | 'borderTopColor' = 'color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property === 'color' ? 'color' : 'border-top-color', token)
  probe.style.borderTopStyle = 'solid'
  document.body.append(probe)
  const value = getComputedStyle(probe)[property]
  probe.remove()
  return value
}

/**
 * The marks of a disabled look a control can carry. A control names the ones it paints, and each
 * named mark is asserted: the text color is `foregroundDisabled`, the edge is `borderDisabled`,
 * the fill is `backgroundNeutral`. A control that paints only a fill still fails when its text
 * keeps full strength, so name every mark the control has.
 */
interface DisabledLook {
  text?: true
  edge?: true
  fill?: true
  /** Also asserts `not-allowed` (default); a wrapper around an input or a menu item passes `false`. */
  cursor?: boolean
}

/**
 * Asserts the disabled look of a control: it is drawn with the disabled tokens, never with
 * `opacity`, which stacks. Each mark named in `look` must match its token; at least one is required.
 */
export async function expectDisabledLook(
  element: Element,
  { text, edge, fill, cursor = true }: DisabledLook
) {
  if (!text && !edge && !fill) throw new Error('Name the marks the disabled control paints')
  const style = getComputedStyle(element)
  await expect(style.opacity).toBe('1')
  if (text) await expect(style.color).toBe(resolvedColor(colors.foregroundDisabled))
  if (edge) {
    await expect(style.borderTopColor).toBe(resolvedColor(colors.borderDisabled, 'borderTopColor'))
  }
  if (fill) await expect(style.backgroundColor).toBe(resolvedColor(colors.backgroundNeutral))
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

/**
 * The backdrop of a modal popup (a dialog or a sheet): its sibling in the portal that paints a
 * background. A focus guard sits between them, so it is not the popup's previous sibling.
 */
export function backdropOf(popup: HTMLElement): HTMLElement {
  // The popup may sit in a scrolling viewport, so look beside it and beside each parent in turn.
  for (let node = popup; node.parentElement && node !== document.body; node = node.parentElement) {
    const backdrop = Array.from(node.parentElement.children).find(
      (el): el is HTMLElement =>
        el !== node &&
        el instanceof HTMLElement &&
        getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'
    )
    if (backdrop) return backdrop
  }
  throw new Error('No backdrop beside the popup')
}

/**
 * Asserts a docked popup (a sheet or a drawer) sits flush against `edge` of the viewport. It
 * waits, since the popup slides in from its edge.
 */
export async function expectDockedTo(element: Element, edge: 'top' | 'right' | 'bottom' | 'left') {
  await waitFor(async () => {
    const rect = element.getBoundingClientRect()
    const root = document.documentElement
    const gap = {
      top: rect.top,
      left: rect.left,
      right: root.clientWidth - rect.right,
      bottom: root.clientHeight - rect.bottom
    }[edge]
    await expect(Math.abs(gap)).toBeLessThanOrEqual(1)
  })
}

/**
 * Asserts the keyboard-highlighted option or menu item draws its state (`highlightedItem` in
 * `styles/popup.stylex.ts`): a fill and a 2px bar on the start edge. When given an unhighlighted
 * sibling, asserts it draws neither, so the state is told apart from the rest of the list.
 */
export async function expectHighlightedItem(item: Element, rest?: Element) {
  await waitFor(async () => {
    await expect(item).toHaveAttribute('data-highlighted')
    await expect(getComputedStyle(item).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    const bar = getComputedStyle(item, '::before')
    await expect(bar.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    await expect(bar.width).toBe('2px')
  })
  if (rest) {
    await expect(rest).not.toHaveAttribute('data-highlighted')
    await expect(getComputedStyle(rest).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await expect(getComputedStyle(rest, '::before').backgroundColor).toBe('rgba(0, 0, 0, 0)')
  }
}

const pickType = (style: CSSStyleDeclaration) =>
  [style.fontFamily, style.fontSize, style.lineHeight, style.letterSpacing].join('|')

/**
 * Asserts a text part draws the type role it names (`type.<role>` in `styles/type.stylex.ts`):
 * family, size, line height, and letter spacing. The weight is left out because a part may set its
 * own (a title is semibold). The role is read from a probe styled by the recipe itself.
 */
export async function expectTypeRole(element: Element, role: keyof typeof type) {
  const probe = document.createElement('span')
  probe.className = stylex.props(type[role]).className ?? ''
  document.body.append(probe)
  const want = getComputedStyle(probe)
  const have = getComputedStyle(element)
  const expected = pickType(want)
  probe.remove()
  await expect(pickType(have)).toBe(expected)
}

/**
 * Asserts the first glyph (an svg) of each `size` cell of a `Sizes` story is `glyphSize[size]`
 * wide, so a glyph grows with its control. Sizes the map has no entry for are skipped.
 */
export async function expectGlyphSizes(root: HTMLElement, sizes: readonly string[]) {
  for (const size of sizes) {
    const glyph = cellOf(root, 'size', size).querySelector('svg')
    const expected = Object.entries(glyphSize).find(([name]) => name === size)?.[1]
    if (!glyph || expected === undefined) throw new Error(`No glyph or no glyphSize for ${size}`)
    await expect(glyph.getBoundingClientRect().width).toBe(expected)
  }
}
