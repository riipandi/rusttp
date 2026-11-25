/**
 * The pixel size of a glyph (an icon component, such as a Keyline icon) in each place a component
 * draws one. They are plain numbers, not StyleX tokens, because the icon takes them as its `size`
 * prop at run time.
 */

/** A glyph beside a label in a control of this size (Button, Select, menu items, Pagination). */
export const glyphSize = {
  xs: 14,
  sm: 16,
  md: 16,
  lg: 18,
  xl: 20
} as const

/** A mark inside a small box or a list row: a check, a chevron, a chip's dismiss cross. */
export const markSize = {
  sm: 10,
  md: 12,
  lg: 14
} as const
