import * as stylex from '@stylexjs/stylex'
import { colors } from '../../styles/colors.stylex'
import { stroke, container } from '../../styles/tokens.stylex'
import { unit, radius } from '../../styles/tokens.stylex'
import { fontFamily, fontWeight, fontSize, fontLineHeight } from '../../styles/tokens.stylex'

/** Minimum height and type of the chips field, at the same heights as `controlSizes`. */
export const comboboxChipsSizes = stylex.create({
  small: { fontSize: fontSize.body2, lineHeight: fontLineHeight.body2, minHeight: unit.x8 },
  medium: { fontSize: fontSize.body2, lineHeight: fontLineHeight.body2, minHeight: unit.x9 },
  large: { fontSize: fontSize.body1, lineHeight: fontLineHeight.body1, minHeight: unit.x10 }
})

export const comboboxStyles = stylex.create({
  inputWrap: {
    position: 'relative',
    width: '100%'
  },
  // The box, state model, and size come from `controlBase` and `controlSizes`.
  input: {
    width: '100%',
    '::placeholder': { color: colors.foregroundNeutralFaded }
  },
  // End padding reserves room for the trigger/clear buttons overlaid on the
  // input — one button width each, none when both are hidden (the size's own
  // padding then applies).
  inputPaddingButtons1: { paddingInlineEnd: unit.x8 },
  inputPaddingButtons2: { paddingInlineEnd: unit.x16 },
  // Shared box for the absolutely-positioned icon buttons overlaid on the
  // input (trigger, clear).
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: colors.foregroundNeutralFaded,
    cursor: 'pointer',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    padding: 0,
    position: 'absolute',
    top: 0,
    width: unit.x8
  },
  inputTrigger: {
    insetInlineEnd: 0
  },
  inputClearAlone: {
    insetInlineEnd: 0
  },
  inputClearWithTrigger: {
    insetInlineEnd: unit.x8
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
  triggerIcon: {
    color: colors.foregroundNeutralFaded,
    display: 'flex'
  },
  // The box and state model come from `controlBase.root` and `.within`; the
  // height is a minimum so wrapped chips grow the field.
  chips: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: unit.x1,
    paddingBlock: unit.x1,
    paddingInline: unit.x2,
    width: '100%'
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.backgroundNeutral,
    borderRadius: radius.small,
    color: colors.foregroundNeutral,
    display: 'inline-flex',
    fontSize: fontSize.caption1,
    gap: unit.x1,
    lineHeight: fontLineHeight.caption1,
    paddingBlock: unit.x1,
    paddingLeft: unit.x2,
    paddingRight: unit.x1
  },
  chipRemove: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radius.small,
    borderStyle: 'none',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    height: unit.x4,
    justifyContent: 'center',
    padding: 0,
    position: 'relative',
    width: unit.x4,
    // Invisible expanded hit area (WCAG 2.5.8: 24px).
    '::after': {
      content: '""',
      inset: `calc(-1 * ${unit.x1})`,
      position: 'absolute'
    }
  },
  chipsInput: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: colors.foregroundNeutral,
    flexBasis: 0,
    flexGrow: 1,
    fontFamily: fontFamily.body,
    fontSize: 'inherit',
    lineHeight: 'inherit',
    minWidth: unit.x16,
    outline: 'none',
    padding: 0,
    '::placeholder': { color: colors.foregroundNeutralFaded }
  },
  // Closed pose (Base UI's [data-starting-style]/[data-ending-style] frames):
  // faded, slightly shrunk, nudged toward the anchor. [data-side] sets the
  // nudge direction; the transition animates entry and exit through it.
  // Shared frames live in `popupFx` (positioner/shift/fade/pose).
  popup: {
    backgroundColor: colors.backgroundElevationOverlay,
    borderRadius: radius.medium,
    color: colors.foregroundNeutral,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fontFamily.body,
    maxHeight: `min(${container.small}, var(--available-height))`,
    maxWidth: 'var(--available-width)',
    opacity: {
      default: 1,
      '[data-starting-style]': 0,
      '[data-ending-style]': 0
    },
    outline: 'none',
    overflow: 'hidden',
    width: 'var(--anchor-width)'
  },
  list: {
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    paddingBlock: unit.x1
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
    lineHeight: fontLineHeight.body2,
    marginInline: unit.x1,
    outline: 'none',
    paddingBlock: unit.x1_5,
    paddingLeft: unit.x2,
    paddingRight: unit.x8,
    position: 'relative',
    userSelect: 'none'
  },
  indicator: {
    alignItems: 'center',
    display: 'flex',
    height: unit.x4,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
    right: unit.x2,
    width: unit.x4
  },
  label: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.caption1,
    fontWeight: fontWeight.medium,
    paddingBlock: unit.x1_5,
    paddingInline: unit.x3
  },
  empty: {
    color: colors.foregroundNeutralFaded,
    // Base UI renders the element with no children while results exist —
    // hide it then so its padding doesn't reserve space.
    display: { default: 'block', ':empty': 'none' },
    fontSize: fontSize.body2,
    paddingBlock: unit.x2,
    textAlign: 'center'
  },
  separator: {
    backgroundColor: colors.borderNeutralFaded,
    height: stroke.ring1,
    marginBlock: unit.x1
  }
})
