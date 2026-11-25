import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke, container } from '../../styles/tokens.stylex'
import { unit, radius, zIndex } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const selectStyles = stylex.create({
  label: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    paddingBlock: unit.x1_5,
    paddingInline: unit.x3
  },
  separator: {
    backgroundColor: colors.borderNeutralFaded,
    height: stroke.ring1,
    marginBlock: unit.x1
  },
  // The box, state model, and size come from `controlBase` and `controlSizes`.
  trigger: {
    alignItems: 'center',
    cursor: { default: 'pointer', ':disabled': 'not-allowed', '[data-disabled]': 'not-allowed' },
    display: 'flex',
    gap: unit.x2,
    justifyContent: 'space-between',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    width: '100%'
  },
  icon: {
    color: colors.foregroundNeutralFaded,
    display: 'flex'
  },
  // With a leading glyph the glyph and the value sit together, so the chevron alone is pushed to
  // the far edge.
  lead: {
    alignItems: 'center',
    display: 'flex',
    gap: unit.x2,
    minWidth: 0
  },
  glyph: {
    color: colors.foregroundNeutralFaded,
    flexShrink: 0
  },
  // Shared frames (positioner/shift/fade/pose) live in `popupFx`. The base
  // popup only fades out; the closed pose applies in anchored mode below.
  popup: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    lineHeight: fontLineHeight.body2,
    maxHeight: 'var(--available-height)',
    opacity: { default: 1, '[data-ending-style]': 0 },
    width: 'var(--anchor-width)',
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'relative'
  },
  // Closed pose (anchored mode only): the shrink + nudge rides `popupFx.pose`
  // and the `--popup-shift-*` custom properties from `popupFx.shift`.
  popupAnchored: {
    maxHeight: `min(${container.small}, var(--available-height))`,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    }
  },
  list: {
    paddingBlock: unit.x1
  },
  scrollArrow: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevationOverlay,
    color: colors.foregroundNeutralFaded,
    cursor: 'default',
    display: 'flex',
    height: unit.x4,
    justifyContent: 'center',
    position: 'sticky',
    width: '100%',
    zIndex: zIndex.sticky
  },
  scrollArrowUp: {
    top: 0
  },
  scrollArrowDown: {
    bottom: 0
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
    display: 'grid',
    fontSize: fontSize.body2,
    gap: unit.x2,
    gridTemplateColumns: `1fr ${unit.x4}`,
    marginInline: unit.x1,
    outline: 'none',
    paddingBlock: unit.x1_5,
    paddingInline: unit.x2,
    userSelect: 'none'
  },
  itemIndicator: {
    alignItems: 'center',
    display: 'flex',
    gridColumnStart: 2,
    justifyContent: 'center'
  },
  itemText: {
    gridColumnStart: 1
  }
})
