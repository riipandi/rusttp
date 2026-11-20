import * as stylex from '@stylexjs/stylex'
import { colors } from 'uilibs/styles/colors.stylex'
import { fontSize, fontWeight, unit } from 'uilibs/styles/tokens.stylex'
import { breakpoints } from '#/styles/constants.stylex'

export const styles = stylex.create({
  // Three zones below the medium breakpoint (trigger, centered brand, account menu), a flex row
  // from there up.
  headerRow: {
    display: {
      default: 'grid',
      [breakpoints.medium]: 'flex'
    },
    gridTemplateColumns: '1fr auto 1fr',
    gap: {
      default: unit.x2,
      [breakpoints.medium]: unit.x6
    }
  },
  brand: {
    justifySelf: 'center'
  },
  menuTrigger: {
    display: {
      default: 'inline-flex',
      [breakpoints.medium]: 'none'
    },
    justifySelf: 'start',
    // The glyph, not the 36px box, lines up with the page's content edge.
    marginInlineStart: `calc(-1 * ${unit.x2})`
  },
  headerEnd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: unit.x2,
    marginInlineStart: {
      default: 0,
      [breakpoints.medium]: 'auto'
    }
  },
  // On small screens the bell is the last item, so its glyph, not its 36px box, lines up with the
  // page's content edge, as the menu trigger does on the other side.
  notifyTrigger: {
    marginInlineEnd: {
      default: `calc(-1 * ${unit.x2})`,
      [breakpoints.medium]: 0
    }
  },
  // The account menu lives in the sheet below the medium breakpoint.
  userMenuSlot: {
    display: {
      default: 'none',
      [breakpoints.medium]: 'flex'
    }
  },
  // The top and bottom room is 24px, the side inset of the entries, and grows past the status bar
  // and the home indicator where the device reports them.
  sheetProfile: {
    gap: 0,
    paddingBlockStart: `max(${unit.x6}, env(safe-area-inset-top))`,
    paddingBlockEnd: unit.x2,
    paddingInline: unit.x4
  },
  // The close button shares the avatar's row, so the two center on one line.
  sheetProfileTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sheetClose: {
    height: unit.x9,
    width: unit.x9
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
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1_5,
    paddingInline: unit.x3
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
  sheetSeparator: {
    marginInline: unit.x3
  },
  // Pinned to the bottom (`SheetFooter` already pushes itself down), clear of the home indicator.
  sheetFooter: {
    gap: unit.x3,
    paddingInline: 0,
    paddingBlockStart: unit.x2,
    paddingBlockEnd: `max(${unit.x3}, env(safe-area-inset-bottom))`
  },
  nav: {
    display: {
      default: 'none',
      [breakpoints.medium]: 'flex'
    },
    alignItems: 'center',
    gap: unit.x1
  },
  navCurrent: {
    color: colors.foregroundNeutral,
    backgroundColor: colors.backgroundNeutralFaded
  },
  navItem: {
    color: colors.foregroundNeutralFaded
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x10,
    paddingBlock: unit.x12
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  title: {
    margin: 0,
    fontSize: fontSize.featured2,
    fontWeight: fontWeight.bold,
    lineHeight: 1.15,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: 0,
    color: colors.foregroundNeutralFaded
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, 1fr)',
      [breakpoints.wide]: 'repeat(4, 1fr)'
    },
    gap: {
      default: unit.x4,
      [breakpoints.medium]: unit.x6
    },
    margin: 0,
    paddingBlock: unit.x6,
    borderBlockWidth: 1,
    borderBlockStyle: 'solid',
    borderBlockColor: colors.borderNeutralFaded
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x1
  },
  summaryLabel: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.body2
  },
  summaryValue: {
    margin: 0,
    fontSize: fontSize.featured3,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: unit.x3
  },
  sectionTitle: {
    margin: 0,
    fontSize: fontSize.featured5,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em'
  },
  muted: {
    color: colors.foregroundNeutralFaded
  },
  skeletonLabel: {
    width: unit.x20,
    height: unit.x4
  },
  skeletonValue: {
    width: unit.x16,
    height: unit.x8
  },
  skeletonText: {
    width: unit.x20,
    height: unit.x4
  },
  skeletonBadge: {
    width: unit.x16,
    height: unit.x6
  }
})
