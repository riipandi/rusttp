import * as stylex from '@stylexjs/stylex'
import { colors, fixedColors } from '../../styles/colors.stylex'
import { container } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

export const tooltipStyles = stylex.create({
  popup: {
    // The overlay surface, as the popover and the menus have it, so a tooltip is the same color as
    // every other popup in both themes (the inverted foreground-on-page pair was a white slab in dark).
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.small,
    color: colors.foregroundNeutral,
    fontFamily: fontFamily.body,
    fontSize: fontSize.caption1,
    lineHeight: fontLineHeight.caption1,
    maxWidth: container.small,
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    paddingBlock: unit.x1_5,
    paddingInline: unit.x3
  },
  // `inverted`: the foreground color as the surface, so a tooltip stands out from a light or dark page.
  popupInverted: { backgroundColor: colors.foregroundNeutral, color: colors.backgroundPage },
  // `dark`: the constant black and white, so the surface is the same in both themes (a tooltip on a
  // photo or a dark canvas).
  popupDark: { backgroundColor: fixedColors.black, color: fixedColors.white },
  // The arrow is a 12x6 SVG that points up for a tooltip below its anchor and is turned for the other
  // sides, so it can carry the popup's ring on its two slanted edges (a filled square cannot: its ring
  // would show inside the popup). Its base sits on the popup's edge; the fill covers the ring between
  // the legs, and the strokes meet the ring's ends. A rotated side needs the extra 1px offset: the
  // box turns about its center, so its 12px length ends up on the other axis.
  arrow: {
    display: 'flex',
    position: 'absolute',
    top: { default: null, '[data-side="bottom"]': `calc(-1 * ${unit.x1_5})` },
    bottom: { default: null, '[data-side="top"]': `calc(-1 * ${unit.x1_5})` },
    left: {
      default: null,
      '[data-side="right"]': `calc(-1 * ${unit.x2} - 1px)`,
      '[data-side="inline-end"]': `calc(-1 * ${unit.x2} - 1px)`
    },
    right: {
      default: null,
      '[data-side="left"]': `calc(-1 * ${unit.x2} - 1px)`,
      '[data-side="inline-start"]': `calc(-1 * ${unit.x2} - 1px)`
    },
    rotate: {
      default: null,
      '[data-side="top"]': '180deg',
      '[data-side="left"]': '90deg',
      '[data-side="inline-start"]': '90deg',
      '[data-side="right"]': '-90deg',
      '[data-side="inline-end"]': '-90deg'
    }
  },
  arrowSvg: {
    display: 'block',
    overflow: 'visible'
  },
  arrowFill: {
    fill: colors.backgroundElevationOverlay
  },
  arrowFillInverted: { fill: colors.foregroundNeutral },
  arrowStrokeInverted: { stroke: colors.foregroundNeutral },
  arrowFillDark: { fill: fixedColors.black },
  arrowStrokeDark: { stroke: fixedColors.black },
  arrowStroke: {
    fill: 'none',
    stroke: colors.borderNeutralFaded,
    strokeWidth: 1
  }
})
