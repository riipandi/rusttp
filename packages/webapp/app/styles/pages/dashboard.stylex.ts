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
    }
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
