import * as stylex from '@stylexjs/stylex'
import { colors } from './colors.stylex'
import { radius, stroke, unit, zIndex } from './tokens.stylex'
import { duration, easing } from './tokens.stylex'

/**
 * Shared anchored-popup recipe for Base UI Positioner/Popup pairs.
 * Used by: tooltip, popover, select, menus, autocomplete, combobox, preview-card.
 *
 * Compose shared styles BEFORE the component's own popup style so local
 * values always win:
 *
 *   {...stylex.props(popupFx.shift, popupFx.fade, popupFx.pose, s.popup, ring.raised)}
 *
 * On the Positioner element use only `positioner`. Components with custom
 * motion (dialog, drawer, sheet, toast, navigation-menu) keep their own
 * transitions instead of `pose`/`fade`.
 *
 * `shift` carries the anchor-nudge custom properties: no `default` value for
 * conditional custom properties — StyleX emits the default rule unlayered
 * (beating the layered [data-*] rules); the `var()` fallback inside `pose`
 * covers the unset case instead.
 */
export const popupFx = stylex.create({
  /** Base UI `Positioner` reset: kill focus outline, sit above page content. */
  positioner: {
    outline: 'none',
    zIndex: zIndex.popover
  },
  /** The backdrop of a modal (dialog, alert dialog, sheet, drawer): the themed `scrim` color. */
  scrim: {
    backgroundColor: colors.scrim
  },
  /** `blurredOverlay`: the page behind the backdrop is blurred by one unit step. */
  scrimBlurred: {
    backdropFilter: `blur(${unit.x1})`
  },
  /** Closed-pose nudge direction from Base UI's `data-side` attribute. */
  shift: {
    '--popup-shift-x': {
      default: null,
      '[data-side="left"]': unit.x2,
      '[data-side="right"]': `calc(-1 * ${unit.x2})`,
      '[data-side="inline-start"]': unit.x2,
      '[data-side="inline-end"]': `calc(-1 * ${unit.x2})`
    },
    '--popup-shift-y': {
      default: null,
      '[data-side="top"]': unit.x2,
      '[data-side="bottom"]': `calc(-1 * ${unit.x2})`
    }
  },
  /** Animation plumbing shared by every anchored popup: transform origin and
   * the opacity/transform transition (disabled motion reduces it to opacity). */
  fade: {
    transformOrigin: 'var(--transform-origin)',
    transitionDuration: duration.fast,
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity'
    },
    transitionTimingFunction: easing.decelerate
  },
  /** Closed pose: faded state handled by the popup's own `opacity`, the
   * shrink + nudge rides the `--popup-shift-*` custom properties. */
  pose: {
    transform: {
      default: 'scale(1)',
      '[data-starting-style]':
        'translate(var(--popup-shift-x, 0px), var(--popup-shift-y, 0px)) scale(0.97)',
      '[data-ending-style]':
        'translate(var(--popup-shift-x, 0px), var(--popup-shift-y, 0px)) scale(0.97)'
    }
  }
})

/**
 * The keyboard-highlighted option or menu item (`data-highlighted`), shared by Select, Combobox,
 * Autocomplete, the menus, and Command. The neutral fill alone is 1.1:1 against the popup, so the
 * mark that carries the state is a 2px `foregroundPrimary` bar on the start edge (3:1 or more in
 * both themes; `contrast.test.ts`). Compose it before the item's own style, and keep the item's
 * `color` for its disabled state. An item that tints its own fill (a critical menu item) sets its
 * `backgroundColor` and the bar color itself.
 */
export const highlightedItem = stylex.create({
  root: {
    '::before': {
      backgroundColor: { default: 'transparent', '[data-highlighted]': colors.foregroundPrimary },
      borderRadius: radius.full,
      content: '""',
      insetBlock: unit.x1,
      insetInlineStart: 0,
      pointerEvents: 'none',
      position: 'absolute',
      width: stroke.ring2
    },
    backgroundColor: { default: 'transparent', '[data-highlighted]': colors.backgroundNeutral },
    position: 'relative'
  }
})
