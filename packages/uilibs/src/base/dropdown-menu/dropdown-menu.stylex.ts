import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke, container } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize } from '../../styles/tokens.stylex'

export const dropdownMenuStyles = stylex.create({
  // Closed pose (Base UI's [data-starting-style]/[data-ending-style] frames):
  // faded, slightly shrunk, nudged toward the anchor. [data-side] sets the
  // nudge direction; the transition animates entry and exit through it.
  // Shared frames live in `popupFx` (positioner/shift/fade/pose).
  popup: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    maxHeight: 'var(--available-height)',
    minWidth: container.xxsmall,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    outline: 'none',
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingBlock: unit.x1,
    width: 'var(--anchor-width)'
  },
  // Submenus anchor to their trigger item — the anchor width is the item, not
  // the menu, so size to content instead.
  subPopup: {
    minWidth: container.xxsmall,
    width: 'max-content'
  },
  item: {
    alignItems: 'center',
    borderRadius: radius.small,
    color: {
      default: null,
      '[data-highlighted]': colors.foregroundNeutral,
      '[data-disabled]': colors.foregroundDisabled
    },
    cursor: 'default',
    display: 'flex',
    fontSize: fontSize.body2,
    gap: unit.x2,
    marginInline: unit.x1,
    outline: 'none',
    paddingBlock: unit.x1_5,
    paddingInline: unit.x2,
    userSelect: 'none'
  },
  // Submenu triggers also light up while their submenu is open.
  subTrigger: {
    backgroundColor: {
      default: 'transparent',
      '[data-highlighted]': colors.backgroundNeutral,
      '[data-popup-open]': colors.backgroundNeutral
    },
    color: {
      default: null,
      '[data-highlighted]': colors.foregroundNeutral,
      '[data-popup-open]': colors.foregroundNeutral,
      '[data-disabled]': colors.foregroundDisabled
    }
  },
  itemInset: {
    paddingInlineStart: unit.x7
  },
  // Reserve room for the trailing check indicator (absolute, at the inline end).
  indicatorItem: {
    paddingInlineEnd: unit.x8,
    position: 'relative'
  },
  // The glyph takes the item's text color and never shrinks.
  itemIcon: { flexShrink: 0 },
  indicator: {
    alignItems: 'center',
    display: 'flex',
    height: unit.x4,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
    insetInlineEnd: unit.x2,
    width: unit.x4
  },
  itemCritical: {
    '::before': {
      backgroundColor: { default: 'transparent', '[data-highlighted]': colors.foregroundCritical }
    },
    backgroundColor: {
      default: 'transparent',
      '[data-highlighted]': colors.backgroundCriticalHighlightedFaded
    },
    color: {
      default: colors.foregroundCritical,
      '[data-disabled]': colors.foregroundDisabled
    }
  },
  itemPrimary: {
    backgroundColor: {
      default: 'transparent',
      '[data-highlighted]': colors.backgroundPrimaryHighlightedFaded
    },
    color: {
      default: colors.foregroundPrimary,
      '[data-disabled]': colors.foregroundDisabled
    }
  },
  subTriggerChevron: {
    color: colors.foregroundNeutralFaded,
    flexShrink: 0,
    marginInlineStart: 'auto'
  },
  shortcut: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    letterSpacing: '0.1em',
    marginInlineStart: 'auto'
  },
  separator: {
    backgroundColor: colors.borderNeutralFaded,
    height: stroke.ring1,
    marginBlock: unit.x1
  },
  label: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    paddingBlock: unit.x1_5,
    paddingInline: unit.x3
  }
})
