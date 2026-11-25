/**
 * The pixel size of a glyph (an icon component, such as a Keyline icon) in each place a component
 * draws one. They are plain numbers, not StyleX tokens, because the icon takes them as its `size`
 * prop at run time.
 */

/** A glyph beside a label in a control of this size (Button, Select, menu items, Pagination). */
export const glyphSize = {
  xsmall: 14,
  small: 16,
  medium: 16,
  large: 18,
  xlarge: 20
} as const

/** A mark inside a small box or a list row: a check, a chevron, a chip's dismiss cross. */
export const markSize = {
  small: 10,
  medium: 12,
  large: 14
} as const
