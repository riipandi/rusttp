import type * as stylex from '@stylexjs/stylex'
import type * as React from 'react'

/**
 * The shared prop vocabulary. A component derives its own `color` and `size` types from these with
 * `Extract` or `Exclude` for an intentional subset, and says so on its docs page, so a role or a
 * size is spelled once.
 */

/** The semantic color roles: a component's `color` is all of these or a documented subset. */
export type ColorRole = 'neutral' | 'primary' | 'positive' | 'warning' | 'critical'

/** The shared control size scale: a Button and a text control of one size are one height. */
export type ControlSize = 'small' | 'medium' | 'large'

/** The scale plus `xsmall` (28px), which only dense press targets have: Button, Toggle, and Tabs. */
export type DenseControlSize = 'xsmall' | ControlSize

/** The `style` prop every part takes: StyleX styles that replace `className` and `style`. */
export interface StyleProp {
  style?: stylex.StyleXStyles
}

/**
 * `T` without the styling props `className` and `style`; `Omitted` names more keys to drop. For a
 * part that must not take a style at all (the Sortable overlay, whose `style` is Dnd Kit's own).
 */
export type WithoutStyling<T, Omitted extends PropertyKey = never> = Omit<
  T,
  'className' | 'style' | Omitted
>

/**
 * The props of a part that wraps `T` (a Base UI part or an element): `T` without `className` and
 * `style`, plus the StyleX `style` prop. `Omitted` names more keys the part redefines, such as
 * `'color'` or `'size'`.
 */
export type PartProps<T, Omitted extends PropertyKey = never> = WithoutStyling<T, Omitted> &
  StyleProp

/**
 * An icon component, such as a Keyline icon, that a component sizes and hides from assistive
 * technology: `Button` `icon`, `Badge` `icon`, `Alert` `icon`, a menu item `icon`, and the rest take
 * this one type. The component picks the size from `styles/glyph.ts`.
 */
export type Glyph = React.ComponentType<{
  size?: number | string
  strokeWidth?: number | string
  'aria-hidden'?: boolean
}>
