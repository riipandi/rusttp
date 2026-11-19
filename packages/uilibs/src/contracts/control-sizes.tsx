import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { expect } from 'storybook/test'
import type { ControlSize, DenseControlSize } from '../styles/control.stylex'

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

const styles = stylex.create({
  hidden: {
    borderWidth: 0,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1
  },
  column: { display: 'flex', flexDirection: 'column', gap: 12, width: 320 }
})

/** A label that names a control without adding to the row, placed after the control so it stays the cell's first element. */
export function HiddenLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} {...stylex.props(styles.hidden)}>
      {children}
    </label>
  )
}

function SizeCells<S extends DenseControlSize>({
  sizes,
  children
}: {
  sizes: readonly S[]
  children: (size: S) => React.ReactNode
}) {
  return (
    <div {...stylex.props(styles.column)}>
      {sizes.map((size) => (
        <div key={size} data-size={size}>
          {children(size)}
        </div>
      ))}
    </div>
  )
}

/** One cell per size of the scale; the control under test is the cell's first element. */
export function ControlSizesColumn({
  children
}: {
  children: (size: ControlSize) => React.ReactNode
}) {
  return <SizeCells sizes={controlSizeNames}>{children}</SizeCells>
}

/** The same with `xs` first, for Button, Toggle, and Tabs. */
export function DenseControlSizesColumn({
  children
}: {
  children: (size: DenseControlSize) => React.ReactNode
}) {
  return <SizeCells sizes={['xs', ...controlSizeNames] as const}>{children}</SizeCells>
}

/** Height of the control in the cell of `size`. */
export function measureControl(root: HTMLElement, size: string) {
  const control = root.querySelector(`[data-size="${size}"]`)?.firstElementChild
  if (!control) throw new Error(`No control rendered for size ${size}`)
  return control.getBoundingClientRect().height
}

/** Asserts every size renders at its height from the scale (or at `heights` for a field that is not one line). */
export async function expectControlHeights(
  root: HTMLElement,
  heights: Partial<Record<DenseControlSize, number>> = controlHeights
) {
  for (const [size, height] of Object.entries(heights)) {
    await expect(measureControl(root, size)).toBe(height)
  }
}
