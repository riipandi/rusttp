import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from './colors.stylex'
import { stroke, unit } from './tokens.stylex'

/**
 * `ring` — the Tailwind `ring-*` equivalent, a static recipe per elevation. Draws the edge as a
 * box-shadow instead of a border, with that elevation's `shadow` layered under it, and composes like
 * any style:
 *
 *   {...stylex.props(styles.popup, ring.raised, style)}
 *   {...stylex.props(popupFx.pose, ring[elevation])}
 *
 * Use it on popups instead of a border: Base UI's align-item-with-trigger math ignores borders (a
 * border shifts the aligned text by its width), and a ring paints outside the box, overlapping the
 * trigger's border for a single crisp edge. `page` is the 2px page-colored separator of an
 * overlapping group (`AvatarGroup`), with no shadow.
 */
export const ring = stylex.create({
  outline: {
    boxShadow: `0 0 0 ${stroke.ring1} ${colors.borderNeutralFaded}, ${shadow.outline}`
  },
  raised: {
    boxShadow: `0 0 0 ${stroke.ring1} ${colors.borderNeutralFaded}, ${shadow.raised}`
  },
  overlay: {
    boxShadow: `0 0 0 ${stroke.ring1} ${colors.borderNeutralFaded}, ${shadow.overlay}`
  },
  page: {
    boxShadow: `0 0 0 ${stroke.ring2} ${colors.backgroundPage}`
  }
})

/** A count of `unit` steps (one step is `unit.x1`, 4px): the keys of `unit`, as numbers. */
export type UnitStep =
  | 0
  | 0.5
  | 1
  | 1.5
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 12
  | 14
  | 16
  | 18
  | 20

/**
 * The CSS length of a size prop: a number counts `unit` steps (`3` is 12px, as in Reshaped), a
 * string is a CSS length taken as written (`'50%'`, `'12rem'`). Pass the result to a dynamic
 * style, such as `stylex.create({ width: (value: string) => ({ width: value }) })`, so a value
 * known only at run time still reaches the stylesheet through a variable and no token is added.
 */
export const unitLength = (value: UnitStep | (string & {})) =>
  typeof value === 'number' ? `calc(${value} * ${unit.x1})` : value

/**
 * A glyph that points along the reading direction (a chevron or an arrow) mirrors in a
 * right-to-left context. A transform has no logical form, so it follows `dir` through
 * `:dir(rtl)`; position and spacing use logical properties instead.
 *
 *   <ChevronRight {...stylex.props(mirrorInRtl.root)} />
 */
export const mirrorInRtl = stylex.create({
  root: { transform: { default: null, ':dir(rtl)': 'scaleX(-1)' } }
})

/**
 * Text for assistive technology only: out of sight and out of the layout, still read. Name an
 * icon-only control or an empty table header with it:
 *
 *   <span {...stylex.props(visuallyHidden.root)}>Actions</span>
 */
export const visuallyHidden = stylex.create({
  root: {
    borderWidth: 0,
    clipPath: 'inset(50%)',
    height: 1,
    // Up, so the box stays inside the container's bottom edge; inline 0, since a negative margin on
    // the end side pushes the 1px box past the page edge in RTL.
    marginBlock: -1,
    marginInline: 0,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1
  }
})

/**
 * The keyboard focus ring: a 2px outline in the primary color, drawn on `:focus-visible` only.
 * Compose it before the component's own style (`stylex.props(focusRing.root, s.root, style)`);
 * set `outlineOffset` locally when the ring must sit inside a clipped box. A StyleX constant
 * cannot carry the value across files (`defineConsts` takes static values, a color variable is
 * not), so the recipe is a style, not a string.
 */
export const focusRing = stylex.create({
  root: {
    outline: {
      default: 'none',
      ':focus-visible': `${stroke.ring2} solid ${colors.foregroundPrimary}`
    }
  }
})
