import type * as stylex from '@stylexjs/stylex'

/**
 * The shared prop vocabulary. A component derives its own `color` and `size` types from these with
 * `Extract` or `Exclude` for an intentional subset, and says so on its docs page, so a role or a
 * size is spelled once.
 */

/** The semantic color roles: a component's `color` is all of these or a documented subset. */
export type ColorRole = 'neutral' | 'primary' | 'positive' | 'warning' | 'critical'

/** The shared control size scale: a Button and a text control of one size are one height. */
export type ControlSize = 'sm' | 'md' | 'lg'

/** The scale plus `xs` (28px), which only dense press targets have: Button, Toggle, and Tabs. */
export type DenseControlSize = 'xs' | ControlSize

/** The `style` prop every part takes: StyleX styles that replace `className` and `style`. */
export interface StyleProp {
  style?: stylex.StyleXStyles
}
