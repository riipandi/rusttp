import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'

// The small-screen navigation drawer shared by the customer header and the admin top bar.
export const styles = stylex.create({
  // The glyph, not the 36px box, lines up with the page's content edge.
  trigger: {
    justifySelf: 'start',
    marginInlineStart: `calc(-1 * ${unit.x2})`
  },
  // The top and bottom room is 24px, the side inset of the entries, and grows past the status bar
  // and the home indicator where the device reports them.
  sheetProfile: {
    gap: 0,
    paddingBlockStart: `max(${unit.x6}, env(safe-area-inset-top))`,
    paddingBlockEnd: unit.x2,
    paddingInline: unit.x4
  },
  sheetClose: {
    height: unit.x9,
    width: unit.x9
  },
  // The brand as the drawer's title, sized like the sidebar's (the logo scales with the font).
  sheetBrand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: unit.x2,
    margin: 0,
    fontSize: fontSize.body1,
    fontWeight: fontWeight.bold
  },
  sheetName: {
    marginBlockStart: unit.x3,
    fontSize: fontSize.body1,
    fontWeight: fontWeight.bold,
    lineHeight: 1.65
  },
  sheetEmail: {
    marginBlockStart: 0
  },
  // Tighter than the sheet's own 16px between sections.
  sheetContent: {
    gap: unit.x3
  },
  sheetNav: {
    paddingInline: unit.x3
  },
  sheetGroupLabel: {
    paddingInline: unit.x3,
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium
  },
  // Icon and label on one row, as in a mobile app drawer.
  sheetItem: {
    justifyContent: 'flex-start',
    gap: unit.x4,
    width: '100%',
    height: unit.x10,
    paddingInline: unit.x3,
    fontSize: fontSize.body1,
    fontWeight: fontWeight.semibold
  },
  sheetItemSecondary: {
    height: unit.x9,
    fontSize: fontSize.body2,
    fontWeight: fontWeight.medium
  },
  // For a long menu: shorter rows, a smaller label, and a tighter gap, the quiet entries a step down.
  sheetItemDense: {
    gap: unit.x3,
    height: unit.x9,
    fontSize: fontSize.body2
  },
  sheetItemSecondaryDense: {
    height: unit.x8
  },
  sheetItemCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded
  },
  // The brand header: the logo on the entries' icons (nav 12 + entry 12), and the close button's box
  // on the entries' right edge (nav 12), not the profile header's 16 on both sides.
  sheetHeaderBrand: {
    paddingInlineStart: unit.x6,
    paddingInlineEnd: unit.x3
  },
  // A host's own footer content has the entries' inset, so a row of 12px padding of its own puts
  // its avatar or icon on the entries' icons above, and its tint on theirs.
  sheetFooterSlot: {
    paddingInline: unit.x3
  },
  // `auto`, not the separator's own 100%: with a side margin that would overflow the drawer.
  sheetSeparator: {
    width: 'auto',
    marginInline: unit.x3
  },
  // Pinned to the bottom (`SheetFooter` already pushes itself down), clear of the home indicator.
  sheetFooter: {
    gap: unit.x3,
    paddingInline: 0,
    paddingBlockStart: unit.x2,
    paddingBlockEnd: `max(${unit.x3}, env(safe-area-inset-bottom))`
  }
})
