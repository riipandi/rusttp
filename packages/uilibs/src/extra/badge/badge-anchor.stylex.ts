import * as stylex from '@stylexjs/stylex'

export const badgeAnchorStyles = stylex.create({
  // `fit-content` keeps the anchor the size of its element inside a column flex, which would stretch it.
  root: {
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
    verticalAlign: 'middle',
    width: 'fit-content'
  },
  // A box with no size sits on the corner point and the badge is centered on it, so the badge's own
  // size never matters. No transform: it would not follow the writing direction, and StyleX's
  // `:dir(rtl)` matches `lang`, not the `dir` attribute.
  badge: {
    alignItems: 'center',
    display: 'flex',
    height: 0,
    justifyContent: 'center',
    position: 'absolute',
    width: 0
  },
  // The badge sits in a flex item that never shrinks: an empty badge (a dot) would shrink to nothing.
  badgeBox: { display: 'inline-flex', flexShrink: 0 }
})

// A circle's rim is closest to the corner point of its box at 45°, which is 14.6% in from the corner
// on both axes ((1 - cos 45°) / 2). `--badge-anchor-inset` carries it to the corners below.
export const badgeAnchorOverlaps = stylex.create({
  rectangular: {},
  circular: { '--badge-anchor-inset': '14.6%' }
})

const inset = 'var(--badge-anchor-inset, 0px)'

export const badgeAnchorCorners = stylex.create({
  topEnd: { insetBlockStart: inset, insetInlineEnd: inset },
  topStart: { insetBlockStart: inset, insetInlineStart: inset },
  bottomEnd: { insetBlockEnd: inset, insetInlineEnd: inset },
  bottomStart: { insetBlockEnd: inset, insetInlineStart: inset }
})
